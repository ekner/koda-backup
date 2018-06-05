const path = require("path");
const request = require("request");
const cheerio = require("cheerio");
const URL = require("url-parse");
const readline = require("readline");
const fs = require("fs");
const JSZip = require("jszip");
const prompt = require("prompt");

const options = require("./options.json");
const cookieJar = request.jar();
const loginPage = "http://koda.nu/login";
const labPage = "http://koda.nu/labbet";
const backupDirectory = "./backups";
const storeName = (new Date().toISOString().substr(0, 10)) + ".koda-bak";
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
prompt.colors = false;

// Log in on koda.nu and store the login session in the cookieJar variable:
function login(callback)
{
    getMail(function(mail) {
        getPass(function(pass) {
            console.log("Loggar in...");

            request.post({url : loginPage, jar: cookieJar, form: {email: mail, password: pass}}, function(err, httpResponse, body) {
                const c = httpResponse.statusCode.toString().substr(0, 1);
                if (err) {
                    error("Kunde inte logga in, kontrollera din nätverksanslutning", err);
                } else if (c !== "2" && c !== "3") {
                    error("Kunde inte ansluta till koda.nu, statuskod " + httpResponse.statusCode);
                } else {
                    // If body is empty, the user has successfully logged in
                    if (body !== "")
                        error("Fel användarnamn eller lösenord");
                    else
                        callback();
                }
            });
        });
    });
}

function getMail(callback)
{
    if (options.email !== "") {
        callback(options.email);
    } else {
        rl.question("Ange e-mail: ", function(mail) {
            rl.close();
            callback(mail);
        });
    }
}

function getPass(callback)
{
    if (options.password !== "") {
        callback(options.password);
    } else {
        prompt.start();
        prompt.message = "";
        prompt.delimiter = ":";
        const props = {password: {hidden: true, description: "Ange lösenord", replace: "*", type: "string"}};
        prompt.get({properties: props}, function(err, result) {
            callback(result.password);
        });
    }
}

// Get the lab page with all projects by using the login session:
function getLabPage(callback)
{
    request.get({url : labPage, jar: cookieJar}, function(err, httpResponse, body) {
        if (err)
            error("Kunde inte gå till labb-sidan, kontrollera din nätverksanslutning", err);
        else
            callback(body);
    });
}

// Download a certain js-file and add it to the zip file:
function extractPage(link, title, store, callback)
{
    request.get({url : link, jar: cookieJar}, function(err, httpResponse, body) {
        if (err) {
            error("Kunde inte ladda ner projektet '" + title + "'", err);
            process.exit();
        } else {
            addToBackup(title, body, store, function() {
                callback();
            });
        }
    });
}

// Loop through all project links on the lab page and call extractPage on them:
function extractPages(body, callback)
{
    console.log("Extraherer länkar...");
    const $ = cheerio.load(body);
    const links = $(".public_link");
    const titles = $("tr");
    const store = prepareBackup();
    var finishedOperations = 0;

    for (var i = 0; i < links.length; ++i) {
        const link = links[i].children[0].data;
        const title = titles[1 + i].children[1].children[0].children[0].data.replace(/ /g, "_");
        extractPage(link, title, store, function() {
            if (++finishedOperations === i) {
                callback(store);
            }
        });
    }
}

function prepareBackup()
{
    if (options.zipFiles) {
        return new JSZip();
    } else {
        var name = storeName;
        for (var i = 0; fs.existsSync(path.join(backupDirectory, name)); ++i)
            name = storeName + i.toString();
        fs.mkdirSync(path.join(backupDirectory, name));
        return name;
    }
}

function addToBackup(title, data, store, callback)
{
    if (options.zipFiles) {
        store.file(title + ".js", data);
        console.log("'" + title + "' nedladdad");
        callback();
    } else {
        const fileName = path.join(backupDirectory, store, title + ".js");
        fs.writeFile(fileName, data, function(err) {
            if (err) {
                error("Kunde inte spara filen '" + fileName + "'", err);
                process.exit();
            } else {
                console.log("'" + title + "' nedladdad och sparad.");
                callback();
            }
        });
    }
}

function finalizeBackup(store)
{
    if (options.zipFiles) {
        var name = storeName;
        for (var i = 0; fs.existsSync(path.join(backupDirectory, name + ".zip")); ++i)
            name = storeName + i.toString();

        console.log("Genererar zip-fil...");
        store.generateNodeStream({type: "nodebuffer", streamFiles: true})
        .pipe(fs.createWriteStream(path.join(backupDirectory, name + ".zip")))
        .on("finish", function () {
            console.log(path.join("./", backupDirectory, name + ".zip") + " skapad.");
        });
    }
}

function error(msg, err)
{
    console.log(msg + "\n");
    if (typeof err !== "undefined" && options.verbose === true)
        throw(err);
    process.exit(1);
}

// Create the backups-directory if it doesn't exist
if (!fs.existsSync(backupDirectory))
    fs.mkdirSync(backupDirectory);

login(function() {
    getLabPage(function(body) {
        extractPages(body, function(store) {
            finalizeBackup(store);
        });
    });
});
