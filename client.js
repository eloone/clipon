// Clipboard Copyright (c) 2014 Elodie Rafalimanana. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

(function(window){
    var socket = io.connect();
    var randomID = (Math.random()+1).toString(36).substring(7);
    var path = window.location.pathname;
    var countElt = document.getElementById('count');
    var inputElt = document.getElementById('input');
    var pathElt = document.getElementById('url');
    var urlElt =  document.getElementById('full_url');
    var userElt = document.getElementById('users');
    var placeholderElt = document.getElementById('placeholder');
    var contentEditable = ('contentEditable' in document.documentElement);
    var full_url = window.location.href;
    var placeholderRaw = 'Just paste your snippet here and go to '+full_url+' on your other device to retrieve it. \nYou can also customize your own url ;)';
    var placeholderHtml;

    //generates a new url
    if(path != '/'+randomID && path == '/'){
        window.location.pathname = randomID;
        path = window.location.pathname;
    }

    //contentEditable = false;

    pathElt.innerHTML = path.replace(/^\//, '');

    urlElt.innerHTML = full_url;

    placeholderHtml = placeholderElt.innerHTML;

/* socket events */
/*--------------------------------------------------------------------------------------------------------------*/
    socket.on('connect', function(){

        socket.emit('connect_client', {path : path});

        //if we keep textarea
        if(!contentEditable){

            inputElt.onfocus = function(){
                var content = inputElt.value;
                
                inputElt.className = '';

                if(content.trim() == placeholderRaw.trim()){
                    inputElt.value = '';
                }

            };

            inputElt.onblur = function(){
                setInactive();
            };

            return;
        }
        
        //if we replace textarea       
        //getting rid of textarea   
        var parent = inputElt.parentNode,
            textarea = inputElt;
        
        inputElt = document.createElement('div');
        inputElt.setAttribute('contenteditable', true);
        inputElt.setAttribute('id', 'input');
        parent.insertBefore(inputElt, textarea);

        parent.removeChild(textarea);
     
        //making links in document clickable
        clickableLinks();       

        //enabling/disabling links
        inputElt.onclick = function(e){
            e.cancelBubble = true;
            
            var content = inputElt.innerHTML;

            inputElt.className = '';

            if(content.trim() == placeholderHtml.trim()){
                inputElt.innerHTML = '';
            }

            inputElt.setAttribute('contenteditable', true);

            if(/<a/ig.test(content)){

                setContent(disableLinks(content));

            }

            socket.emit('set_active');
        };

        //fakes onblur since onblur doesn't trigger after click on div
        document.onclick = function(){
 
            setInactive();

        }
        
    });

    socket.on('server_ready', function(data){

        setCount(data.count);

        setContent(data.input);
        
        setPlaceholder();

        inputElt.onkeyup = function(){
            var input = getInputValue();

            socket.emit('client_input', input);
        };

    });

    socket.on('server_input', function(input){
        setContent(input);
        setInactive();
    });

    socket.on('empty', function(input){
        setContent('');
        setInactive();
    });

    socket.on('set_inactive', function(){
        setInactive();
    });

    socket.on('disconnected', function(data){
        setCount(data.count);
    });

/* functions */
/*--------------------------------------------------------------------------------------------------------------*/
    //replaces plain urls with links
    //inspired from http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
    function enableLinks(text) {
 
        var exp = /(<a.*href="[^"']*"[^>]*>\s*)?(href=")?(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])(<\/a>)?/ig;

        return text.replace(exp, function(match, $1, $2, $3, $4){
            if(!$1 && !$2 && !$4){
                return '<a href="'+$3+'" target="_blank">'+$3+'</a>';
            }else{
                return match;
            }
        });
    }

    //replaces links with plain urls
    function disableLinks(text){

        var exp = /<a(.*)href\s*=\s*"?'?([^'"]*)"?'?[^>]*>(.*)<\/a>/ig;

        return text.replace(exp, '$2');
    }

    function detectUrls(text){

        var exp = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

        return exp.test(text);
    }

    function clickableLinks(){
        var a = document.getElementsByTagName('A');

        for (var i = a.length - 1; i >= 0; i--) {
            a[i].onclick = function(e){
                e.cancelBubble = true;
            }       
        };
    }

    function clickableContentLinks(){
        var children = inputElt.childNodes;

        for (var i = children.length - 1; i >= 0; i--) {
            if(children[i].tagName == 'A'){
                children[i].onclick = function(e){
                    e.cancelBubble = true;
                }
            }
        };
    }

    function setContent(content){
        inputElt.className = '';

        setInputValue(formatInput(content));

    };

    function setInactive(){
        var content, placeholder, tmpContent, tmpPlaceholder;

        content = getInputValue();
        placeholder = getPlaceholder();
        tmpContent = clearSpace(stripTags(content));
        tmpPlaceholder = clearSpace(stripTags(placeholder));

        if(contentEditable){
            inputElt.setAttribute('contenteditable', false);

            if(tmpContent !== '' && tmpContent !== tmpPlaceholder){
                if(detectUrls(content)){
                    setContent(enableLinks(content));
                    clickableContentLinks();
                }
            }

        }

        setPlaceholder();
    }

    function setPlaceholder(){
        var content, placeholder, tmpPlaceholder, tmpPlaceholder;

        content = getInputValue();
        placeholder = getPlaceholder();

        tmpContent = clearSpace(stripTags(content));
        tmpPlaceholder = clearSpace(stripTags(placeholder));

        if(tmpContent == ''){
            inputElt.className = 'empty';
            setInputValue(placeholder);
            socket.emit('empty');
        }else{
            if(tmpContent == tmpPlaceholder){
                inputElt.className = 'empty';

                if(content != placeholder){
                    setInputValue(placeholder);
                    socket.emit('empty');
                }
            }
        }
    }

    function setCount(count){
        countElt.innerHTML = count;

        if(count < 2){
            userElt.innerHTML = 'user is';
        }else{
            userElt.innerHTML = 'users are';
        }
    }

    function getPlaceholder(){
        if(contentEditable){
            return placeholderHtml;
        }else{
            return placeholderRaw;
        }
    }

    function setInputValue(value){
        if(contentEditable){
            inputElt.innerHTML = value;
        }else{
            inputElt.value = value;
        }
    }

    function getInputValue(){
        if(contentEditable){
            return inputElt.innerHTML;
        }else{
            return inputElt.value;
        }
    }

    function formatInput(text){

        if(contentEditable){
            //replaces text line breaks by html line breaks
            text = text.replace(/\n/ig, '<br/>');

        }else{
            //replaces html line breaks and block-level html tags by text line breaks
            text = text.replace(/(<br\s*\/?>)|(<(div|p|table|ul|tr)[^>]*>)/ig, '\n');
            //replaces table columns tags by spaces to keep the table readable
            text = text.replace(/<(td|th)[^>]*>/ig, ' ');
            //removes all the remaining closing tags from the text
            text = stripTags(text);
        }

        //removes any line break present at the beginning of the text
        text = text.replace(/^\s*\n*/ig, '');

        return text;
    }

    function stripTags(text){
        return text.replace(/(<([^>]+)>)/ig,"");
    }

    function clearSpace(text){
        text = text.trim().replace(/\s+|\r+/ig, ' ');

        return text;
    }

})(this);
