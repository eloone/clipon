# CLIPON

<http://clipon.herokuapp.com/>

## Pitch

Copy paste text across different computers through the Internet.

## Typical usage 

* Customize your own url into http://clipon.herokuapp.com/whatever
* Paste a snippet and retrieve it on your other device from http://clipon.herokuapp.com/whatever
* Share some volatile text with several users 

## Features

* No login
* No reload
* Instant copy
* Clickable copied links
* Copy HTML (on HTML5 browsers) or plain text (on older browsers)
* Click outside the input box to make links clickable
* The data is public
* The data is persistent only during your session you can reload your page without any loss
* The data expires when all connected users quit a given url

## Design

I just wanted to copy paste so to not be tempted to redo google docs I designed it like this :

* No database
* No Express
* No jQuery
* Just socket.io and websockets

These are good restrictions for focused development... :) !

## Warning

* On non websockets enabled browsers the instant copy can be slow.
