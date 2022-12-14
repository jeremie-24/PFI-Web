const ImageFilesRepository = require('./imageFilesRepository.js');
const UserModel = require('./user.js');
const utilities = require("../utilities");
const HttpContext = require('../httpContext').get();
const TokenManager = require('../tokenManager');

module.exports =
    class UsersRepository extends require('./repository') {
        constructor() {
            super(new UserModel(), true);
            this.setBindExtraDataMethod(this.bindAvatarURL);
        }
        bindAvatarURL(user) {
            if (user) {
                let bindedUser = { ...user };
                delete bindedUser.Password;
                if (bindedUser.VerifyCode !== "verified")
                    bindedUser.VerifyCode = "unverified";
                if (user["AvatarGUID"] != "") {
                    bindedUser["AvatarURL"] = HttpContext.host + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
                } else {
                    bindedUser["AvatarURL"] = "";
                }
                return bindedUser;
            }
            return null;
        }
        add(user) {
            user["Created"] = utilities.nowInSeconds();
            if (this.model.valid(user)) {
                user["AvatarGUID"] = ImageFilesRepository.storeImageData("", user["ImageData"]);
                delete user["ImageData"];
                return this.bindAvatarURL(super.add(user));
            }
            return null;
        }
        update(user) {
            if (this.model.valid(user)) {
                let foundUser = super.get(user.Id);
                if (foundUser) {
                    user["Created"] = foundUser["Created"];
                    user["AvatarGUID"] = ImageFilesRepository.storeImageData(user["AvatarGUID"], user["ImageData"]);
                    delete user["ImageData"];
                    return super.update(user);
                }
            }
            return false;
        }
        remove(id) {
            let token = utilities.getToken(require('../httpContext').get());
            let foundUser = super.get(id);
            var ImagesRepository = require("./imagesRepository.js");
            var imagesRepository = new ImagesRepository();
            if (foundUser && token != null && foundUser && id == token["UserId"]) {

                var images = require("../data/Images.json");
                images.forEach(element => {
                    if (element["UserId"] && element.UserId == id){
                        imagesRepository.remove(element.Id);
                    }
                });
                ImageFilesRepository.removeImageFile(foundUser["AvatarGUID"]);
                TokenManager.logout(id);
                return super.remove(id);
            }
            return false;
        }
    }
