$(function() {
  /*!
  * jquery.key.js 0.2 - https://github.com/yckart/jquery.key.js
  * The certainly simpliest shortcut key event handler ever
  *
  * Copyright (c) 2013 Yannick Albert (http://yckart.com)
  * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
  * 2013/02/09
  */
  ;(function ($, document) {
    var keys = {a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,shift:16,ctrl:17,control:17,alt:18,option:18,opt:18,cmd:224,command:224,fn:255,"function":255,backspace:8,osxdelete:8,enter:13,"return":13,space:32,spacebar:32,esc:27,escape:27,tab:9,capslock:20,capslk:20,"super":91,windows:91,insert:45,"delete":46,home:36,end:35,pgup:33,pageup:33,pgdn:34,pagedown:34,left:37,up:38,right:39,down:40,"!":49,"@":50,"#":51,"$":52,"%":53,"^":54,"&":55,"*":56,"(":57,")":48,"`":96,"~":96,"-":45,_:45,"=":187,"+":187,"[":219,"{":219,"]":221,"}":221,"\\":220,"|":220,";":59,":":59,"'":222,'"':222,",":188,"<":188,".":190,">":190,"/":191,"?":191};
    $.key = $.fn.key = function (code, fn) {
        if (!(this instanceof $)) { return $.fn.key.apply($(document), arguments); }

        var i = 0,
            cache = [];

        return this.on({
            keydown: function (e) {
                var key = e.which;
                if (cache[cache.length - 1] === key) return;
                cache.push(key);

                i = key === code[i] || ( typeof code === 'string' && key === keys[code.split("+")[i]] ) ? i + 1 : 0;
                if ( i === code.length || ( typeof code === 'string' && code.split('+').length === i ) ) {
                    fn(e, cache);
                    i = 0;
                }
            },
            keyup: function () {
                i = 0;
                cache = [];
            }
        });
    };
  })(jQuery, document);

  /*
    Key bindings
  */
  $.key('ctrl+s', function() {
    if($('#settingsCode').length > 0 || $('#htmlSettings1').length > 0 || $('#summernote').length > 0){
      event.preventDefault();

      // Summernote in code-view does not post updated data. Refresh data:
      if ($('#summernote').length > 0) {
        var scrollPos = $(document).scrollTop();
        var scrollPosSum = $(".note-editor").offset().top
        $(".btn-codeview").click();
      }

      $.ajax({
        url: $("form.standard").attr("action") + "?inbackground=true",
        type: 'POST',
        data: $("form.standard").serialize(),
        success: function(response) {
          if (response == "OK") {
            $("#save").attr("data-ischanged", "0");
            $("#notifySaved").css("top", $('#navbar').offset().top);
            $("#notifySaved").text("Saved");
            $("#notifySaved").show(400);
            setTimeout(function(){ 
              $("#notifySaved").hide(400);
            }, 1700);
          } else {
            $("#notifySaved").css("background", "#cb274bde");
            $("#notifySaved").css("top", $('#navbar').offset().top);
            $("#notifySaved").text(response);
            $("#notifySaved").show(400);
            setTimeout(function(){
              $("#notifySaved").hide(400);
              $("#notifySaved").css("background", "#27cb4ede");
            }, 1700);
          }
        }
      });

      if ($('#summernote').length > 0) {
        $(".btn-codeview").click();
        setTimeout(function(){  
          $('html, body').animate({
            scrollTop: scrollPos
          }, 400);
          $('.note-editor').animate({
            scrollTop: scrollPosSum
          }, 400);
        }, 1000);
      }
    }
  });



  /*
    Submit forms
  */
  $( ".newblogSave" ).click(function() {
    $(".btn-codeview").click();
    $("#newblogData form").submit();
  });



  /*
      Check if data is saved
  */
  $(window).bind("beforeunload", function() {
    if ($("#save").attr("data-ischanged") == "1") {
      return "You have unsaved changes that is not saved. Change page?";
    }
  });

  $(document).submit(function(){
    $("#save").attr("data-ischanged", "0")
  });



  /*
      Initialize editors
  */
  if($('#summernote').length > 0 ){
    $('#summernote').summernote({
      minHeight: 300,
      toolbar: [
        ['insert', ['bricks']],
        ['style', ['style', 'fontname', 'fontsize', 'bold', 'italic', 'underline']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['misc', ['codeview', 'fullscreen']]
      ],
      codemirror: { 
        theme: 'monokai'
      },
      callbacks: {
        onKeydown: function(e) {
          $("#save").attr("data-ischanged", "1");
        },
        onInit: function() {
        }
      }
    });
  }


  if($('#htmlSettings1').length > 0 ){
    var settingsCode1 = CodeMirror.fromTextArea($('#htmlSettings1')[0], {lineNumbers: true});
    settingsCode1.on('change', function () {
      $("#save").attr("data-ischanged", "1");
      settingsCode1.save();
    });
  }

  if($('#htmlSettings2').length > 0 ){
    var settingsCode2 = CodeMirror.fromTextArea($('#htmlSettings2')[0], {lineNumbers: true});
    settingsCode2.on('change', function () {
      $("#save").attr("data-ischanged", "1");
      settingsCode2.save();
    });
  }

  if($('#htmlSettings3').length > 0 ){
    var settingsCode3 = CodeMirror.fromTextArea($('#htmlSettings3')[0], {lineNumbers: true});
    settingsCode3.on('change', function () {
      $("#save").attr("data-ischanged", "1");
      settingsCode3.save();
    });
  }

  if($('#settingsCode').length > 0 ){
    var settingsCode = CodeMirror.fromTextArea($('#settingsCode')[0], {lineNumbers: true});
    settingsCode.on('change', function () {
      $("#save").attr("data-ischanged", "1");
      settingsCode.save();
    });
  }

  /*Saving on ctrl+s = todo
    settingsCode.on("keyup", function (cm, event) {
    event = {
      type: "keydown",
      keyCode: event.keyCode,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    };
    if (event.keyCode == 27 && event.ctrlKey == true) {
      console.log("Saving");
      cm.triggerOnKeyDown(event);		
    }
  });*/
});


