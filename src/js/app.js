/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var Settings = require('settings');
var UI = require('ui');
var Vector2 = require('vector2');
var Voice = require('ui/voice');
var Vibe = require('ui/vibe');
var ajax = require('ajax');
var pod;
var answer;
var platform = 'basalt';
var x;
var y;
var vibe_preference = Settings.option('vibe');
var confirm_preference = Settings.option('confirm');
var configuring = true;


if(Pebble.getActiveWatchInfo) {
  platform = Pebble.getActiveWatchInfo().platform;
} else {

}

if (platform == "chalk"){
  x = 180;
  y = 180;
} else {
  x = 144;
  y = 168;
}

var main = new UI.Window({
  backgroundColor:'white',
  fullscreen:true,
  scrollable:true
});

var image = new UI.Image({
  position: new Vector2(10,-58),
  size: new Vector2(x-20,y),
  image: "images/menu_icon.png"
});

var query = new UI.Text({
  color:'black',
  position: new Vector2(10, 46),
  size: new Vector2(x-20,60),
  textAlign:'center',
  text:''
});

var result = new UI.Text({
  color: 'red',
  position: new Vector2(10, 94),
  size: new Vector2(x-20, y),
  font: 'gothic-28-bold',
  textAlign: 'center',
  textOverflow: 'ellipsis',
  text: '',
});


Settings.config(
  { url: 'http://your-config-page-here' },
  function(e) {
     console.log('opened');
     configuring = true;
     Voice.dictate('stop');

  },
  function(e) {
    console.log('closed configurable');
    configuring = false;

    // Show the parsed response
    console.log(JSON.stringify(e.options));
    confirm_preference = e.options['confirm'];
    vibe_preference = e.options['vibe'];
    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);
configuring = false;


main.add(image);
main.add(query);
main.add(result);
main.show();
var parse = function(){
  if ("expression that describes if the response is valid"){
    answer = "parse/prettify the response here";
    if (answer.length > 50){
      result.font("gothic-24-bold");
    } else {
      result.font("gothic-28-bold");
    }
    result.size(new Vector2(x-20, (y+(answer.length*5))));
    result.text(answer);
    if (vibe_preference){
      Vibe.vibrate('short');
    }
  } else {
    result.text("Something went wrong.");
    query.text("ERROR:");
    if (vibe_preference){
      Vibe.vibrate('long');
    }
  }
}

var ask = function(){
  console.log("Confirm? " + confirm_preference);
  Voice.dictate('start', confirm_preference, function(e) {
    if (e.err) {
      console.log('Error: ' + e.err);
      return;
    }

    query.text(e.transcription);
    result.text("Loading...");
    console.log(encodeURIComponent(e.transcription));
    ajax(
      {
        url: "http://api.service-provider.com/?input=" + encodeURI(e.transcription),
        type: 'xml'
      },
      function(data, status, request) {
        console.log("http://api.service-provider.com/?input=" + encodeURI(e.transcription));

        try {
          parse();
        } catch (e) {
          console.log(e);
          result.text("Something went wrong.");
          query.text("ERROR:");
        }
      },
      function(error, status, request){
        result.text("Something went wrong.");
        query.text("ERROR:");
      }
    );
  });
};

if (!configuring){
  ask();
}

main.on('click', 'select', function(){
  ask();
});

/**/
