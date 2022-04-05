var selectFile;
var BUCKET = 'cloud-computing-b2';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function display_photo_lists(listofpics){
  //empty old picture display
  $("#pictures").empty()

  //insert all new pictures 
  console.log(eval(listofpics));
  $.each(eval(listofpics), function(i, datum){
      console.log(datum)
      var dyn_pic = $("<img class='pics' src= 'https://cloud-computing-b2.s3.amazonaws.com/" + datum + "' alt=''" +datum+"'>");
      $("#pictures").append(dyn_pic);
  })
}

$(document).ready(function(){
    const fileInput = document.getElementById('files');
    const searchbtn = document.getElementById('submit');
    start_image();
    fileInput.addEventListener('change', (event) => {
        const fileList = event.target.files;
        console.log(fileList);
        getfile(fileList);
      });
      $(document).on("click", "#submit", function(){                
        getSet();
    })

    $("#search-bar").keypress(function(e){     
      if(e.which == 13) {
          getSet();
      }   
    })
})

function upload(){
  var label = document.getElementById('custom-input').value;
  var nameoffile = selectFile[0]['name']
  var image_type = selectFile[0]['type']
  console.log(nameoffile);
  console.log(label);


  var sdk = apigClientFactory.newClient({
    defaultContentType: image_type,
  });

  getBase64(selectFile[0]).then(data => {
    console.log('data: ' + data)
    sdk.uploadBucketKeyPut({
      "key": nameoffile,
      "bucket": BUCKET,
      "x-amz-meta-customLabels": label,
      "Content-Type": image_type
    }, data, {'headers': {
      'Content-Type': image_type
    }}).catch(function (result){
      console.log("FAILED " + JSON.stringify(result))
    }).then(function (result){
      console.log("SUCCESS " + JSON.stringify(result))
    });
  })
}

function start_image(){
  var sdk = apigClientFactory.newClient({});
  sdk.searchGet(
    {
      "q" : ''
    }, {}, {}).catch(function (result){ 
      console.log("FAILED " + JSON.stringify(result))
    }).then(function (result){
      console.log("SUCCESS " + JSON.stringify(result))
      console.log(result["data"])
      var listofpics = result["data"];
      display_photo_lists(listofpics);
    });
}

function getSet(){
  var q = document.getElementById("search-bar").value;
  console.log("start search " + q)
  var sdk = apigClientFactory.newClient({});
  sdk.searchGet(
    {
      "q" : q
    }, {}, {}).catch(function (result){ 
      console.log("FAILED " + JSON.stringify(result))
    }).then(function (result){
      console.log("SUCCESS " + JSON.stringify(result))
      console.log(result["data"])
      var listofpics = result["data"];
      display_photo_lists(listofpics);
      document.getElementById("search-bar").value = ''
      document.getElementById('search-bar').focus()
    });
}

function getfile(fileList){
    selectFile = fileList;
}

function startRecognition() {
  let recognition = new SpeechRecognition();

  recognition.onstart = () => {
    console.log('Started listening...')
  }

  recognition.onspeechend = () => {
    console.log(`I stopped listening.`);
    recognition.stop();
  }

  recognition.onresult = (result) => {
    console.log('heard: ' + result.results[0][0].transcript)
    document.getElementById("search-bar").value = result.results[0][0].transcript;
    getSet()
  };

  recognition.start()
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    console.log('file' + file)
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log('string value: ' + reader.result)
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  })
}
