/** -*- coding: utf-8 -*-
* @fileOverview Speech+ Plugin for CKeditor 4
* @license Copyright (c) 2017-2020 by Henry Kroll III of thenerdshow.com All rights reserved.
* For a copy of the Apache 2.0 license, see LICENSE.txt
*
* Adapted from:
* Google. (2017). Web Speech API Demonstration. Retrieved February 01, 2017 from view-source:https://www.google.com/intl/en/chrome/demos/speech.html  
* Agarwal, A. (2016). How to Add Speech Recognition to your Website. [tutorial] Retrieved February 01, 2017 from https://www.labnol.org/software/add-speech-recognition-to-website/19989/
* CKSource. (2017). Creating a CKEditor Plugin in 20 Lines of Code Retrieved February 01, 2017 from http://docs.cksource.com/CKEditor_3.x/Tutorials/Timestamp_Plugin
*/

( function() {
"use strict";
var commands, translate, selection;
var editor1 = CKEDITOR.instances[(Object.keys(CKEDITOR.instances)[0])];
  
// get language translated commands from lang/es.json
function speechLang(slang){
  const suffix = ".json?v=v9";
  var lel = document.getElementById( 'languages' ) || {},
  lang = slang || lel.value || editor1.config.language || "en-US";
  const commandsPath = CKEDITOR.plugins.getPath("speech")+"commands"+suffix;
  const translatePath = CKEDITOR.plugins.getPath("speech")+"lang/"+lang.slice(0,2)+suffix;
  const fetchJson = async (path)=>(await fetch(path)).json();
  fetchJson(commandsPath) .then(v=>commands = v);
  if (lang.slice(0,2) != 'en') fetchJson(translatePath).then(v=>translate = v);
  else translate = null;
  return lang;
}
CKEDITOR.plugins.add( 'speech',
{
  icons: 'micadj,mic,system-help',
  lang: 'af,ar,az,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,es-mx,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn',
  getCommands: ()=>commands||null,
  setCommands: (c)=>commands=c,
  getTranslate: ()=>translate||null,
  setTranslate: (t)=>translate=t,
  
	init: function( editor1 )
	{
		//Plugin logic goes here.
    var pluginName = 'speech',
    lang = editor1.lang.speech;

    editor1.addCommand( 'help',
      {
        exec : function( editor1 )
            {
                // load content from edit_help.html
                window.open(CKEDITOR.getUrl("plugins/speech/edit_help.html"), '_blank');
            }
      });
      
    editor1.ui.addButton( 'SpeechHelp',
      {
        label: lang.xabout,
        command: 'help',
        icon: 'system-help', // http://fedoraproject.org/
          toolbar: 'about,1'
      } );

    editor1.addCommand( 'speechCommands', new CKEDITOR.dialogCommand( 'speechCommandsDialog' ) );
      editor1.ui.addButton( 'speechCmds', {
          label: lang.xcommands,
          command: 'speechCommands',
          icon: 'micadj',
          toolbar: 'about,1'
      });
      
    CKEDITOR.dialog.add( 'speechCommandsDialog', this.path + 'dialogs/commands.js?v=6' );

      editor1.ui.addButton( 'Speech',
      {
        label: lang.xspeech,
        command: 'speech',
        icon: 'mic',
          toolbar: 'about'
      } );

      editor1.addCommand( 'speech',
        {
          exec : function( editor1 )
              {
                  startDictation( editor1 );
                  var receiver = document.querySelector("#welcomeMessage");
                  if (receiver) receiver.style.display="none";
              }
        });

        editor1.setKeystroke([
        [ CKEDITOR.ALT + 83 /*S*/, 'speech' ],
        [ 27 /*Esc*/, 'speech' ],
        [ CKEDITOR.ALT + 112 /*F1*/, 'help' ],

        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 70 /*F*/, 'removeFormat' ],
        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 82 /*R*/, 'right' ],
        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 76 /*L*/, 'left' ],
        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 69 /*E*/, 'center' ],
        [ CKEDITOR.CTRL + 13 /*Enter*/, 'source' ],
        [ CKEDITOR.CTRL + CKEDITOR.SHIFT + 76 /*L*/, 'link' ],
        [ CKEDITOR.CTRL + 77 /*M*/, 'maximize' ],

]);
      speechLang();
  
  	}
} );
/*To use the recognition and synthesis parts of the spec in Firefox when it becomes available, you’ll need to enable the media.webspeech.recognition.enable and media.webspeech.synth.enabled flags in about:config.
https://hacks.mozilla.org/2016/01/firefox-and-the-web-speech-api/
*/
  var recognizing = false;
  function startDictation(editor) {
    var mic_id = editor.ui.get("Speech")._.id;
    var mic = document.getElementById(mic_id);
    var final_transcript = '';
    if (recognizing) {
      recognizing = false;
      mic.style.background = "";
      if (typeof recognition != "undefined") {
        recognition.stop();
      }
      return;
    } else recognizing = true;
    var bot = document.querySelector(".cke_bottom");
    if(!bot) bot = document.querySelector("#cke_1_top");
    var interim_span = document.createElement("span");
    bot.appendChild(interim_span);
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition || mozSpeechRecognition || msSpeechRecognition || oSpeechRecognition;
    if (SpeechRecognition) {
      window.recognition = new SpeechRecognition();
      // continuous mode causes Chrome Android to repeat sentences
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang() || editor1.config.language;
      recognition.start();
      mic.style.background = "salmon";
      
      recognition.onend = function() {
        // keep it going maybe
        if (recognizing) {
          try { recognition.start(); }
          catch {}
        } else mic.style.background = "";
      };
      
      recognition.onresult = function(e) {
        var interim_transcript = '';
        if (typeof event.results == 'undefined') return recognition.stop();
        for (var i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final_transcript = linebreak(e.results[i][0].transcript);
            insertText(editor, final_transcript.trim());
          } else {
            interim_transcript = e.results[i][0].transcript;
          }
        }
        interim_span.innerHTML = linebreak(interim_transcript);
      };
      
      recognition.onerror = function(e) {
        recognizing = false;
        recognition.stop();
        mic.style.background = "";
      }
    }
  }

function linebreak(s) {
  var two_line = /\n\n/g;
  var one_line = /\n/g;
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

/** getLR
* Get text to the left and right of current selection
* These are CKEditor ranges. They have their own syntax.
*/
function getLR(range) { 
    // get text to left and right of cursor
  var r, l, rs = range.startContainer;
  if (rs.$.nodeType == 1) {
    var lr = rs.getChild(range.startOffset - 1);
    l = lr? lr.getText() : "", r = "";
  } else {
    r = rs.getText().slice(range.endOffset);
    l = rs.getText().slice(0, range.startOffset);
  }
  return [l,r];
}

/** backspace
* These are CKEditor ranges. They have their own syntax.
*/
function bs(range) {
    var rc = range.clone();
    if (rc.startContainer.$.nodeType == 3) { // is a text node
        var rsc = range.startContainer, roff = range.startOffset;
        rc.selectNodeContents(range.getCommonAncestor());
        rc.setEnd(rsc, roff);
        rc.setStart(rc.endContainer, rc.endOffset - 1);
    }
    else { // nodetype 1
        rc.selectNodeContents(rc.getPreviousNode());
        rc.startOffset = rc.endOffset - 1;
    }
    rc.deleteContents();
}

/** insertText by Henry Kroll, www.thenerdshow.com
* @param {object} editor instance
* @param {string} text to insert
*/
function insertText(editor1, txt) {    
    selection = editor1.getSelection();
    var range = selection.getRanges()[0];
    var txl = txt.toLocaleLowerCase();
  
    function gotoLine(element, start = false) {
      element.scrollIntoView();
      element = start? element.getChild(0):
                       element.getChild(element.getChildCount() - 1);
      range.setStart(element, start? 0 : element.$.length);
      range.setEnd(  element, start? 0 : element.$.length);
      selection.selectRanges([range]);
    }
    
    function capitalize(s, cap = true) {
      return s.match(/^\s?\w/)? s.replace(/\w/, function(m) { 
        return cap? m.toUpperCase() : m.toLowerCase();
      }): s;
    }
    
    function titleCaps(s) {
      var words = s.toLowerCase().split(' ').map(word => capitalize(word));
      return words.join(' ');
    }
    
    function selectWord(command, txl, before = false, after = false) {
      // see https://stackoverflow.com/questions/4401469/how-to-select-a-text-range-in-ckeditor-programatically
      var findString = txl.slice(command.toString().length -2);
      var element = selection.getStartElement();
      //wrap around search
      var searchStart = element, count = 10000;
      //find next if already selected
      if (selection.getSelectedText().toLowerCase() == findString)
        element = element.getNext();
      while (element && (element = element.getNextSourceNode()
        || editor1.document.getBody().getFirst())) {
        if (!(count -= 1) || element == searchStart) return; //not found
        //search only text nodes
        if (!element.$.nodeType == 3) continue;
        var startIndex = element.getText().toLowerCase().indexOf(findString);
        if (startIndex != -1) {
          try {
            range.setStart(element, after? startIndex + findString.length: startIndex);
            range.setEnd(element, before? startIndex: startIndex + findString.length);
            selection.selectRanges([range]);
            element.getParent().scrollIntoView();
            return true;
          } catch { continue; }
        }
      } return false;
    }
    
    
    
    // export some shortcuts for commands to use
    var ele = selection.getStartElement().$, html = ele.innerHTML;
    function dce(e,t) {
      var ele=document.createElement(e);
      ele.innerHTML=t;
      return ele;
    }
    
    // translate txl lower-case text command
    if (translate && translate[txl]) txl = txt = translate[txl];
    
    // perform txl voice editing commands
    var command = commands[txl]||"";
    if (command && command.match(/^return /)) return eval(command.slice(7));
    else eval(command);
    
    // "select .*"
    if (translate) command = RegExp(translate["select "]);
    else command = RegExp(commands["select "]);
    if (txl.search(command) >= 0 && selectWord(command, txl)) return;
    
    // "insert before .*"
    if (translate) command = RegExp(translate["insert before "]);
    else command = RegExp(commands["insert before "]);
    if (txl.search(command) >= 0 && selectWord(command, txl, true)) return;
    
    // "insert after .*"
    if (translate) command = RegExp(translate["insert after "]);
    else command = RegExp(commands["insert after "]);
    if (txl.search(command) >= 0 && selectWord(command, txl, false, true)) return;
    
    // fix messed-up spacing around hyphen
    txt = txt.replace(/\s?-\s?/gi, "-");

    // from Browse Tutorials. (June, 2015). Get Cursor Position in CKEditor. Retrieved February 01, 2017 from https://browse-tutorials.com/snippet/get-cursor-position-ckeditor
    // Capitalization / punctuation logic is for right-to-left
    // languages, so we prepared an if statement to check this.
    // March 06, 2017
    if (selection.root.getDirection(1) == "ltr") {
        var i, [l,r] = getLR(range);
        function regStart(txt, reg) {
          var m = txt.match(reg);
          return m? m[0].length - 1 : -1;
        }
        // if inserting a punctuated sentence in the middle of another
        // cap next fragment
        if (regStart(r, /^\s*[a-z]/) >= 0 // if followed by lower case letter
            && txt.match(/[.:!?…]$/) // and txt ends with .
        ) {
            txt = txt + " ", r = capitalize(r.trimStart());
        }
        // if inserting punctuation at start
        if (txt.match(/^[.,-@:!?'…]/)){
            l = l.trimEnd();
            // Cap remaining dictated fragment, if any
            if ((i = regStart(txt, /^[ .:!?…]*[a-z]/) >= 0)) {
                txt = txt.substr(0, i) + txt[i].toUpperCase()
                + txt.substr(i + 1);
            }
        } else if (l.match(/[^\^\\'\/ \[{$\(@\-–—]$/)) {
          // insert space between fragments
          txt = " " + txt;
        }
        // cap start of new sentence fragment
        if (l.match(/^\s?$/) || l.match(/[.:!?…]\s?$/)) {
            txt = capitalize(txt);
            // if fragment not punctuated, uncap (merge) remaining fragment
            if (r.match(/^\s?[A-Z]/) && txt.match(/[^.:!?…]\s?$/))
              r = capitalize(r, false);
        }
        // Add space if joining words
        if (txt.match(/\S$/) && r.match(/^\w/)) txt = txt + " ";
    }
    // render HTML as text for inserting into text nodes
    function renderHTML(txt) {
      var tmpDiv = document.createElement("div"); tmpDiv.innerHTML = txt;
      return tmpDiv.innerText || tmpDiv.textContent || txt;
    }
    // if editable node
    var rs = range.startContainer;
    if(rs.$.nodeType == 3 && txt[0] != "<") {
      txt = renderHTML(txt);
      // modify node text
      l = l + txt; rs.setText(l + r);
      // set cursor after
      range.setStart(rs, l.length);
      range.setEnd(rs,   l.length);
      selection.selectRanges([range]);
    } else editor1.insertHtml(txt); // create new node
    editor1.undoManager.save(); // save undo point
}
})();
