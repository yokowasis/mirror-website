var shell = require("shelljs");

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

// Curl find and replce string
function curlReplace(url:string, file:string, find:string, replace:string) {
    shell.exec(`curl -L ${url} | sed -e "s/${find}/${replace}/g" > ${file}`);
}

// Move File
function moveFile(file:string, dest:string) {
    shell.exec(`mv ${file} ${dest}`);
}

function goMirror() {
    curlReplace("https://dev3.mgbksmasoloraya.com","website.html","dev3\.mgbksmasoloraya\.com","mgbksmasoloraya.b-cdn.net");
    moveFile("website.html","/data/wwwroot/backend.mgbksmasoloraya.com/index.html");
    curlReplace("https://dev3.mgbksmasoloraya.com/edu-expo-2021/","website.html","dev3\.mgbksmasoloraya\.com","mgbksmasoloraya.b-cdn.net");
    moveFile("website.html","/data/wwwroot/backend.mgbksmasoloraya.com/edu-expo-2021/index.html");    
}

goMirror();

setTimeout(() => {
    goMirror();    
}, 1000 * 60 * 10);