# Web Cache Size Tests

This utility was created to test the file and maximum size available for a web application. There is one test to detect the maximum chunk size and a second one to test the maximum size.
To run the tests, a Node.js server creates some random strings and send them to the browser. After one ressource is loaded, the script loads all ressource loaded before again and is able to detect wether the are loaded ressource are cached or fresh.


## Requirements
node 

## Installation
* Run ```node server.js```
* Navigate to http://127.0.0.1:8080 or what port you've entered in your config-file.
* This test uses only core-modules from Node.js

## Note

The Node.js server can handle Request until 256 MB size. When you request a larger size, the server will response multiple parts as a stream. So every size is possible, until your system ressources are reached.

## Sample results (28.02.2018)

Chunk size is the maximum size a file can have to get cached.
Cache size is the maximum storage for one page

||Browser | private mode | chunk size | cache size |
| --- | --- | --- | --- | --- |
| PC 1 | Chrome 64 | no | 28 MB | 1,9 GB |
| | | yes | 6 MB | 49 MB |
| | Firefox 58 | no | 43 MB | 349 MB |
|| | yes | 4 MB | 76 - 185 MB |
|| Edge 16 | no | 2.000 MB (1) | 2,441 GB (2) |
|| | yes | 0 MB | 0 MB |
| PC2 | Chrome 64 | no | 40 MB | 4,3 GB |
|| | yes | 6 MB | 49 MB |
|| Firefox 58 | no | 43,7 MB | 348 MB |
|| | yes | 4 MB | 50 - 267 MB |
|| Edge 16 | no | 1,001 GB (1) | 1,73 GB |
|| | yes | 0 MB | 0 MB |
| MC1 | Safari 11 | no | 63 MB | 500 MB |
|| | yes | 63 MB | 63 MB |
| TBLT1 | Safari 11 | no | 15 MB | 500 MB |
|| | yes | 15 MB | 15 MB |
| HNDY1 | Chrome 64 | no | 25 MB | 185 MB |
|| | yes | 6 MB | 49 MB |
|| Firefox 58 | no | 4 MB | 44 - 199 MB |
|| | yes | 128 KB | 1 MB |
|| WebKit 537 | no | 2,5 MB | 12 MB |
| HNDY2 | Chrome 64 | no | 25 MB | 185 MB |
| TBLT2 | Chrome 64 | no | 25 MB | 675 MB |
|| | yes | 15 MB | 38 MB |
|| Firefox 58 | no | 40 MB | 340 MB |
|| | yes | 42 MB | 25 MB |
|| Edge 16 | no | 150 MB | 150 MB \(2)|
|| | yes | 0 MB | 0 MB |

(1) Node.js was terminated throwing "heap out of memory" error
(2) This test was canceled, because the page was reloaded



|| Type | OS | RAM (GB) | Free ssd (GB) |
| --- | --- | --- | --- | --- |
| PC1 | PC | Windows 10 | 16 | 25,1 |
| PC2 | Zenbook | Windows 10 | 9,45 | 118 |
| MC1 | Mac Mini | macOS 10.13 | 4 | 131 |
| TBLT1 | iPad 5.Gen | iOS 11 | 2 | 27 |
| HNDY1 | Galaxy S7 | Android 7 | 4 | 9,5 |
| HNDY2 | Xperia Z5 Compact | Android 7 | 2 | 11,5 |
| TBLT2 | Lenovo Yoga 2 | Windows 10 | 1,89 | 12 |
