CKEDITOR.dialog.add( 'speechCommandsDialog', function ( editor ) {
  var lang = editor.lang.speech;
    return {
        title: lang.xspoken,
        minWidth: 400,
        minHeight: 200,

        contents: [
            {
                id: 'tab-basic',
                label: lang.editable, //'Editable Commands',
                elements: [

{
    type: 'html',
      id: 'voiceCmds',
    html: '<table spellcheck="false"><tbody><thead><td>'+lang.saythis+'</td><td>'+lang.dothis+'</td></thead></tbody></table>'
}
            ]
            },
            {
                id: 'tab-adv',
                label: lang.xspecial, //'Special Characters',
                elements: [



{
    type: 'html',
      id: 'voiceChars',
    html: '<table spellcheck="false"><tbody><thead><td>'+lang.saythis+'</td><td>'+lang.typethis+'</td></thead></tbody></table>'
}


            ]
            }
        ],
            
      onShow: function(e){
        // get element
        var id = this.getContentElement('tab-basic','voiceCmds').domId,
        speech = this.getParentEditor().plugins.speech,
        ele = document.getElementById(id),
        commands = speech.getCommands(),
        language = speech.getTranslate();
        ele.contentEditable = true;
        
        // todo: remove test vars
        window.testTable = ele;
        window.testdialogG = this;
        
        // style table
        var tdstyle = "box-shadow: inset 0 1px 2px rgba(0,0,0,.39), 0 -1px 1px #FFE, 0 1px 0 #FFE;";
        ele.tHead.style.background="rgb(234, 236, 253)";
        ele.tHead.style.fontWeight="900";
        
        // clear commands table
        var trs = ele.querySelectorAll("tr");
        for (var i = 1; trs[i]; i++) trs[i].remove();
        // create reverse lookup language dictionary
        var dict = {};
        if (translate)
        Object.keys(translate).forEach(function(e){
          if(e.slice(-1)==" ")
            dict[e] = translate[e];
          else
            dict[translate[e]] = e;
        });
        
        // build editable commands table dialog
        Object.keys(commands).forEach(function(k){
          var tr = document.createElement('tr');
          var  td1 = document.createElement('td');
          td1.style = tdstyle;
          td1.innerHTML = (k in dict)? dict[k] : k;
          var td2 = document.createElement('td');
          td2.innerHTML=commands[k]; td2.style = tdstyle;
          tr.appendChild(td1); tr.appendChild(td2);
          ele.appendChild(tr);
        });
      },
      onOk: function(e){
        // get element
        var id = this.getContentElement('tab-basic','voiceCmds').domId;
        var ele = document.getElementById(id);
        
        
        
      }
    }
});