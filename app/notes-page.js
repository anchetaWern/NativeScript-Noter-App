var Observable = require("data/observable");
var ObservableArray = require('data/observable-array');

var pageArray = new ObservableArray.ObservableArray();
var pageData = new Observable.Observable({
    notes: pageArray
});

var cameraModule = require("camera");
var view = require("ui/core/view");

var uiEnums = require("ui/enums");
var animation = require("ui/animation");

var appSettings = require("application-settings");

var fs = require("file-system");

var page;

var notesArr = [];

var current_index = -1;

exports.pageLoaded = function(args) {
    page = args.object;
    pageData.set('showForm', true);

    var new_note_title = appSettings.getString('new_note_title');
    var notes = appSettings.getString('notes');
  
    if(!notes){    
      notes = [
        {
          index: 0,
          title: '100 push ups'
        },
        {
          index: 1,
          title: '100 sit ups'
        },
        {
          index: 2,
          title: '100 squats'
        },
        {
          index: 3,
          title: '10km running'
        }
      ];

    }else{
      notes = JSON.parse(notes);
    }

    notesArr = notes;
    if(!pageArray.length){
      for(var x = 0; x < notes.length; x++){
        current_index += 1;
        pageArray.push(notes[x]);
      }
    }

    pageData.set('item_title', new_note_title);
    args.object.bindingContext = pageData;

    view.getViewById(page, 'form').animate({
        translate: { x: 0, y: 160 },    
        duration: 800,
    });

};


exports.newNote = function() {

  var showForm = pageData.get('showForm');
  var top_position = (showForm) ? -160 : 160; 
  var list_visibility = (showForm) ? 1 : 0;

  view.getViewById(page, 'list').animate({
    opacity: list_visibility,
    duration: 400 
  });

  view.getViewById(page, 'form').animate({
      translate: { x: 0, y: top_position },    
      duration: 800,
  });

  pageData.set('showForm', !showForm);
}


exports.btnLoaded = function (args) {
  var btn = args.object;
  btn.android.setFocusable(false);
}


exports.saveNote = function() {
  
  var new_note_title = pageData.get('item_title');
  var new_note_photo = pageData.get('attachment_img');

  current_index += 1;
  var new_index = current_index;
 
  var new_item = {
    index: new_index,
    title: new_note_title,
    photo: new_note_photo,
    show_photo: false
  };

  notesArr.push(new_item);
  pageArray.push(new_item);
 
  appSettings.setString('notes', JSON.stringify(notesArr));
 
  appSettings.setNumber('current_index', new_index);

  appSettings.remove('new_note_title');
  appSettings.remove('new_note_photo');

  pageData.set('showForm', false);
  pageData.set('item_title', '');
  pageData.set('attachment_img', null);
  
  view.getViewById(page, 'list').animate({
    opacity: 1,
    duration: 400 
  });

  view.getViewById(page, 'form').animate({
      translate: { x: 0, y: -160 },    
      duration: 800,
  });

}


exports.openCamera = function() {
  appSettings.setString('new_note_title', pageData.get('item_title'));
  cameraModule.takePicture({width: 300, height: 300, keepAspectRatio: true}).then(function(img) {
  
    var filepath = fs.path.join(fs.knownFolders.documents().path, "img_" + (new Date().getTime() / 1000) + ".jpg");
    img.saveToFile(filepath, uiEnums.ImageFormat.jpeg);
    
    appSettings.setString('new_note_photo', filepath);
    pageData.set('attachment_img', filepath);

  });
}

exports.deleteNote = function(args){
  
  var target = args.object;

  var index_to_delete = notesArr.map(function(e) { 
    return e.index; 
  }).indexOf(target.index);

  notesArr.map(function(item, index){

    if(index == index_to_delete){
      notesArr.splice(index_to_delete, 1);
      pageArray.splice(index_to_delete, 1);
      return false;
    }
  });

  appSettings.setString('notes', JSON.stringify(notesArr));
}