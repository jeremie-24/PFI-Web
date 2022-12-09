
 // Attention de ne pas avoir des références circulaire
 // const UsersRepository = require('./usersRepository'); pas ici sinon référence ciculaire
const ImageFilesRepository = require('./imageFilesRepository.js');
const UsersRepository = require('./usersRepository');
const ImageModel = require('./image.js');
const utilities = require("../utilities");
const Token = require('./token.js');
const TokenManager = require('../tokenManager');
const HttpContext = require('../httpContext').get();
const CollectionFilter = require("./collectionFilter.js");

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
        getAll(params = null) {
            let objectsList = this.objects();
            if (this.bindExtraDataMethod != null) {
              objectsList = this.bindExtraData(objectsList);
            }
            if (params) {
               objectsList =  this.getKeywordsObjectList(objectsList, params);
                let collectionFilter = new CollectionFilter(
                    objectsList,
                    params,
                    this.model
                  );
                return collectionFilter.get();
            }
            return objectsList;
        }
        getKeywordsObjectList(objectsList, params){
            let keywords;
            if (params && params["keywords"]) {
                if(!params["keywords"] ||params["keywords"].Length < 1){
                    return objectsList;
                }
                keywords = this.getKeywords(params["keywords"]);
            }
            if(keywords){
                objectsList = this.searchKeywordsObjectList(objectsList, keywords);
            }
            return objectsList;
        }
        getKeywords(paramKeywords){
            let keywords = paramKeywords.split(" ");
            return keywords;
        }
        searchKeywordsObjectList(objectsList, keywords){
            let result = objectsList;
            /*
            keywords.forEach(keyword =>{
                result.push(this.getKeywordFilterResult(objectsList, keyword));
            })
            */
            result = objectsList.filter(object => this.evaluatedKeysContainsKeyword(object, keywords))
            return result;
        }
        /*
        getKeywordFilterResult(objectsList, keyword){           
            return objectsList.filter(object => this.evaluatedKeysContainsKeyword(object, keyword))
        }
        
        evaluatedKeysContainsKeyword(object, keyword){
            let containsKeyword = false;
            let evaluatedKeys = ["Title", "Description"];
            evaluatedKeys.forEach(key => {
                if(this.containsKeyword(object[key], keyword)){
                    return true;
                };
            });
            return containsKeyword;
        }
        */
        evaluatedKeysContainsKeyword(object, keywords){
            let containsKeyword = false;
            let evaluatedKeys = ["Title", "Description"];
            evaluatedKeys.forEach(key => {
                keywords.forEach(keyword => {
                    if(!containsKeyword && this.containsKeyword(object[key], keyword)){
                        containsKeyword = true;
                    };
                })
            });
            return containsKeyword;
        }
        containsKeyword(value, keyword){
            return this.valueMatch(value, `*${keyword}*`)
        }

        valueMatch(value, searchValue) {
            try {
                let sv = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
                let v = value.toString().replace(/(\r\n|\n|\r)/gm, "").toLowerCase();
                return new RegExp(sv).test(v);
            } catch (error) {
                console.log(error);
                return false;
            }
        }

    }