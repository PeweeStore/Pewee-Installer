var platform = require('os').platform();
var program = require('commander');
var Prompt = require('prompt-improved');
var Download = require('download');
var progress = require('download-status');
var chalk = require('chalk');

var prompt = new Prompt({
  prefix: "",
  suffix: " ?\n",
  prefixTheme: Prompt.chalk.bold,
  defaultTheme: Prompt.chalk.bold,
  textTheme: Prompt.chalk.white,
  defaultPrefix: ' (default : '
});

var fs = require('fs');

var defaultInstallFolderPath = '/opt/peweed/Pewee'
var defaultDataFolderPath = '/opt/peweed/PeweeStore'

program
  .version('0.0.1', '-V, --version')
  .option('-i, --installFolder <install folder>', 'The folder where you want to install Pewee store')
  .option('-d, --dataFolder <data folder>', 'The folder where you want to save configuration and app')
  .parse(process.argv)


var installFolder = program.installFolder;
var dataFolder = program.dataFolder;

var questions = new Array();
if(installFolder === null || installFolder === undefined || installFolder.length == 0) {
  questions.push({
    question: 'Install folder',
    key: 'installFolder',
    required: true,
    default: defaultInstallFolderPath
  });
}

if(dataFolder === null || dataFolder === undefined || dataFolder.length == 0) {
  questions.push({
    question: 'Data storage folder',
    key: 'dataFolder',
    required: true,
    default: defaultDataFolderPath
  });
}

var createInstallFolder = function(callback) {
  fs.mkdir(installFolder, callback);
}

var createDataFolder = function(callback) {
  fs.mkdir(dataFolder, callback);
}

var downloadLastPeweeInstallToInstallFolder = function(callback) {
  var download = new Download()
  download.get('https://github.com/PeweeStore/Pewee/archive/master.zip', installFolder, { extract: true, strip: 1})
  download.run(function(err, files) {
    if(err) {
      callback(err);
    } else {
      callback(null);
    }
  })
}


var confirmInstall = function() {
  prompt.ask({
    question: '\n\nConfiguration defined: \nInstall pewee to '+installFolder+'\nInstall pewee storage to '+dataFolder+'\nAre you sure',
    required:true,
    default: 'Y',
    boolean:true
  }, function(err, res) {
    if(res) {
      console.log(chalk.white("Install ..."));
      console.log(chalk.white("Create install folder..."));
      createInstallFolder(function(err) {
        if(err) { console.error("Error : %s", err); return; }
        console.log(chalk.white("Create data storage folder..."));

        createDataFolder(function(err) {
          if(err) { console.error("Error : %s", err); return; }

          console.log(chalk.white("Download and extract Pewee to install folder..."));
          downloadLastPeweeInstallToInstallFolder(function(err) {
            if(err) { console.error("Error : %s", err); return; }
            else {
              console.log("\n" +
                chalk.white.bgGreen.bold("Pewee successfully installed to " + installFolder) + "\n" +
                "\n" +
                chalk.white("Now run") + "\n" +
                "\n" +
                "\t" + chalk.grey("cd " + installFolder + " && npm update") + "\n" +
                "\n" +
                chalk.white("for finish the installation.") + "\n" +
                "\n" +
                chalk.white("-------------") + "\n" +
                "\n" +
                chalk.white("To run Pewee, execute ") + chalk.white.bold("node " + installFolder + "/bin/pewee -d \"" + dataFolder + "\"")
              );
              process.exit(0)
            }
          })
        })
      })
    } else {
      console.log("Cancel.");
    }
  })
}

if (questions.length > 0) {
  prompt.ask(questions, function(err, res) {
    dataFolder = res.dataFolder;
    installFolder = res.installFolder;
    confirmInstall();
  });
} else {
  confirmInstall();
}
