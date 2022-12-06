
 // Attention de ne pas avoir des références circulaire
 // const UsersRepository = require('./usersRepository'); pas ici sinon référence ciculaire
const ImageFilesRepository = require('./imageFilesRepository.js');
const UsersRepository = require('./usersRepository');
const ImageModel = require('./image.js');
const utilities = require("../utilities");
const Token = require('./token.js');
const TokenManager = require('../tokenManager');
const HttpContext = require('../httpContext').get();

module.exports =
    class ImagesRepository extends require('./repository') {
        constructor() {
            super(new ImageModel(), true /* cached */);
            this.setBindExtraDataMethod(this.bindImageURL);
            this.userRepository = new UsersRepository();
        }
        bindImageURL(image) {
            if (image) {
                let bindedImage = { ...image };
                if (image["GUID"] != "") {
                    bindedImage["OriginalURL"] = HttpContext.host + ImageFilesRepository.getImageFileURL(image["GUID"]);
                    bindedImage["ThumbnailURL"] = HttpContext.host + ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
                    bindedImage["AvatarURL"] =this.userRepository.get(image["UserId"]).AvatarURL;
                    bindedImage["UserName"] =this.userRepository.get(image["UserId"]).Name;
                } else {
                    bindedImage["OriginalURL"] = "";
                    bindedImage["ThumbnailURL"] = "";
                    bindedImage["AvatarURL"] = "";
                    bindedImage["UserName"] = "";
                }
                return bindedImage;
            }
            return null;
        }
        add(image) {
            if (this.model.valid(image)) {
                image["GUID"] = ImageFilesRepository.storeImageData("", image["ImageData"]);
                delete image["ImageData"];
                return this.bindImageURL(super.add(image));
            }
            return null;
        }
        update(image) {
            let foundImage = super.get(image.Id);
            if (this.model.valid(image) && foundImage && image.UserId == foundImage.UserId) {
                image["GUID"] = ImageFilesRepository.storeImageData(image["GUID"], image["ImageData"]);
                delete image["ImageData"];
                return super.update(image);
            }
            return false;
        }
        remove(id) {
            let token = utilities.getToken(require('../httpContext').get());
            let foundImage = super.get(id);
            if (token != null && foundImage && foundImage["UserId"] == token["UserId"]) {
                ImageFilesRepository.removeImageFile(foundImage["GUID"]);
                return super.remove(id);
            }
            return false;
        }
    }