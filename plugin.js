/**                                       -*- coding: utf-8 -*-
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
var editor1 = CKEDITOR.instances[(Object.keys(CKEDITOR.instances)[0])];

CKEDITOR.plugins.add( 'speech',
{
	init: function( editor1 )
	{
		//Plugin logic goes here.
	}
} );

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
	label: 'Speech Help Alt+F1',
	command: 'help',
	icon: 'plugins/speech/system-help.gif', // http://fedoraproject.org/
    toolbar: 'editing'
} );

editor1.addCommand( 'speech',
	{
		exec : function( editor1 )
        {
            startDictation( editor1 );
        }
	});

editor1.ui.addButton( 'Speech',
{
	label: 'Speech Dictation',
	command: 'speech',
	icon: 'plugins/speech/mic.gif',
    toolbar: 'editing'
} );

editor1.setKeystroke([
        [ CKEDITOR.ALT + 83 /*S*/, 'speech' ],
        [ CKEDITOR.ALT + 112 /*F1*/, 'help' ],

        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 70 /*F*/, 'removeFormat' ],
        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 82 /*R*/, 'right' ],
        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 76 /*L*/, 'left' ],
        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 69 /*E*/, 'center' ],
        [ CKEDITOR.ALT + CKEDITOR.SHIFT + 83 /*S*/, 'source' ],
        [ CKEDITOR.CTRL + 13 /*S*/, 'source' ],
        [ CKEDITOR.CTRL + CKEDITOR.SHIFT + 76 /*L*/, 'link' ],
        [ CKEDITOR.CTRL + 77 /*M*/, 'maximize' ],

]);
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
    }
    var bot = document.querySelector("#cke_1_bottom");
    if(!bot) bot = document.querySelector("#cke_1_top");
    var interim_span = document.createElement("span");
    bot.appendChild(interim_span);
    recognizing = true;
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    if (SpeechRecognition) {
      window.recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      // default to browser's lang setting http://stackoverflow.com/questions/18557494/how-to-detect-users-language
      recognition.lang = window.navigator.language
            || navigator.userLanguage || "en-US";
      recognition.start();
      mic.style.background = "salmon";
      
      recognition.onend = function() {
        // keep it going
        //~ recognition.start();
        mic.style.background = "";
      };
      
      recognition.onresult = function(e) {
        var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
          recognition.onend = null;
          recognition.stop();
          mic.style.background = "";
          return;
        }
        for (var i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final_transcript = linebreak(e.results[i][0].transcript);
            insertText(editor, final_transcript.trim());
          } else {
            interim_transcript += e.results[i][0].transcript;
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

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

/** getLR
* Get text to the left and right of current selection
* These are CKEditor ranges. They have their own syntax.
*/
function getLR(range) { 
    // get text to left of cursor
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
    var selection = editor1.getSelection();
    var range = selection.getRanges()[0];
    var txl = txt.toLowerCase();
  
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
  
    //voice editing commands
    if (txl == "whoops"
     || txl == "what's"
     || txl == "undo"
    ) return editor1.undoManager.undo();
    
    if (txl == "select all")  return editor1.document.$.execCommand('SelectAll');
    if (txl == "maximize")    return editor1.execCommand("maximize");
    if (txl == "file save")   return fileSave(editor1);
    if (txl == "backspace" )  return bs(range);
    if (txl == "delete that") return range.deleteContents();
    if (txl == "embolden that")       return editor1.execCommand("bold");
    if (txl == "italicize that")      return editor1.execCommand("italic");
    if (txl == "strike that")         return editor1.execCommand("strike");
    if (txl == "superscript that")    return editor1.execCommand("superscript");
    if (txl == "subscript that")      return editor1.execCommand("subscript");
    if (txl == "underline that")      return editor1.execCommand("underline");
    if (txl == "blockquote that")     return editor1.execCommand("blockquote");
    if (txl == "bullet that")         return CKEDITOR.tools.callFunction(97);
    if (txl == "number that")         return CKEDITOR.tools.callFunction(94);
    if (txl == "insert symbol")         return CKEDITOR.tools.callFunction(52);
    if (txl == "insert horizontal line")return CKEDITOR.tools.callFunction(49);
    
    if (txl == "heading one")         return CKEDITOR.tools.callFunction(123,'h1');
    if (txl == "heading two")         return CKEDITOR.tools.callFunction(123,'h2');
    if (txl == "heading three")       return CKEDITOR.tools.callFunction(123,'h3');
    if (txl == "left justify that")   return CKEDITOR.tools.callFunction(124,'Left');
    if (txl == "center that")         return CKEDITOR.tools.callFunction(124,'Centered');
    if (txl == "indent that")         return CKEDITOR.tools.callFunction(124,'Indented');
    if (txl == "hanging indent that") return CKEDITOR.tools.callFunction(124,'Hanging');
    if (txl == "color that red")    return CKEDITOR.tools.callFunction(124,'Red');
    if (txl == "color that orange") return CKEDITOR.tools.callFunction(124,'Orange');
    if (txl == "color that purple") return CKEDITOR.tools.callFunction(124,'Purple');
    if (txl == "color that green") return CKEDITOR.tools.callFunction(124,'Green');
    if (txl == "color that blue") return CKEDITOR.tools.callFunction(124,'Blue');
    
    if (txl == "capitalize that")   txt = capitalize(selection.getSelectedText());
    if (txl == "uncapitalize that") txt = capitalize(selection.getSelectedText(), false);
    if (txl == "title case") txt = titleCaps(selection.getSelectedText());
    if (txl == "mute")        return editor1.execCommand("speech");
    if (txl == "end of line") return gotoLine(selection.getStartElement());
    if (txl == "beginning of line") return gotoLine(selection.getStartElement(), true);
    if (txl == "beginning of document") return gotoLine(selection.root.getFirst(), true);
    if (txl == "go to the end" ||
        txl == "end of document") return gotoLine(selection.root.getLast());
    if (txl.search(/select /) > -1) {// see https://stackoverflow.com/questions/4401469/how-to-select-a-text-range-in-ckeditor-programatically
        var findString = txt.slice(txt.indexOf(' ') + 1).toLowerCase();
        var element = selection.getStartElement();
        //wrap around search
        var searchStart = element, count = 10000;
        //find next if already selected
        if (selection.getSelectedText().toLowerCase() == findString)
            element = element.getNext();
        while (element = element.getNextSourceNode()
            || editor1.document.getBody().getFirst()) {
            if (!(count -= 1) || element == searchStart) return; //not found
            //search only text nodes
            if (!element.$.nodeType == 3) continue;
            var startIndex = element.getText().toLowerCase().indexOf(findString);
            if (startIndex != -1) {
              try {
                    range.setStart(element, startIndex);
                    range.setEnd(element, startIndex + findString.length);
                    selection.selectRanges([range]);
                    element.getParent().scrollIntoView();
                    return;
                } catch { continue; }
            }
        }
    }
    
    // fix missing punctuation in dictation AI (Kroll, February 03, 2017)
    txt = txt.replace(/HTTP colon slash slash\s?/i, "http://");
    txt = txt.replace(/HTTPS colon slash slash\s?/i, "https://");
    txt = txt.replace(/make a link to (.*\.\w+)/i, 
        function(match, $1){ return " <a href=\"http://" +$1.replace(/\s/g, "")});
    txt = txt.replace(/\s?with link text\s?(.*)/i,
        function(match, $1){ return "\">"+$1+"</a> " });
    txt = txt.replace(/\s?apostrophe\s?/gi, "&apos;");
    txt = txt.replace(/\s?tab key\s?/gi, "\t");
    txt = txt.replace(/\s?ellipses/gi, "&hellip;");
    txt = txt.replace(/ampersand/gi, "&amp;");
    txt = txt.replace(/\s?asterisk/gi, "*");
    txt = txt.replace(/at sign/gi, "@");
    txt = txt.replace(/\s?at symbol\s?/gi, "@");
    txt = txt.replace(/\s?backslash\s?/gi, "\\");
    txt = txt.replace(/open bracket\s?/gi, "[");
    txt = txt.replace(/\s?close bracket/gi, "]");
    txt = txt.replace(/\s?colon$/gi, ":");
    txt = txt.replace(/\s?comma$/gi, ",");
    txt = txt.replace(/\s?comma\s/gi, ", ");
    txt = txt.replace(/\s?semicolon$/gi, ";");
    txt = txt.replace(/open parentheses\s?/gi, "(");
    txt = txt.replace(/\s?close parentheses/gi, ")");
    txt = txt.replace(/less.than symbol\s?/gi, "&lt;");
    txt = txt.replace(/\s?greater.than symbol/gi, "&gt;");
    txt = txt.replace(/open quote\s?/gi, "\"");
    txt = txt.replace(/\s?close quote/gi, "\"");
    txt = txt.replace(/open.?.? curly quote\s?/gi, "&ldquo;");
    txt = txt.replace(/\s?close.? curly quote/gi, "&rdquo;");
    txt = txt.replace(/\s?long dash\s?/gi, "&mdash;");
    txt = txt.replace(/\s?short –\s?/gi, "&ndash;");
    txt = txt.replace(/\s?-\s?/gi, "-");
    txt = txt.replace(/ degrees Fahrenheit\s?/gi, "&deg;F");
    txt = txt.replace(/ degrees Ceckeditor_wiris_formulaEditor','ckeditor_wiris_formulaEditorChemistry','ckeditor_wiris_CASlsius\s?/gi, "&deg;C");
    txt = txt.replace(/\s?copyright symbol\s?/gi, "&copy;");
    txt = txt.replace(/\s?trademark symbol\s?/gi, "&trade;");

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
        } else if (l.match(/[^\^\\'\/ [{$(@-–—]$/)) {
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
    if(rs.$.nodeType == 3 && txt != "<p></p>") {
      txt = renderHTML(txt);
      // modify node text
      l = l + txt; rs.setText(l + r);
      // set cursor after
      range.setStart(rs, l.length);
      range.setEnd(rs,   l.length);
      selection.selectRanges([range]);
    } else editor1.insertHtml(txt); // create new node
}
})();
