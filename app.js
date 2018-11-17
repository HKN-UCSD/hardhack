var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');

var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');


// Get spreadsheet
// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet('1S14qpLSagNGl9EqYlSZ22OZZldvX8LfKJDuZJKoCqE0');

var doc2 = new GoogleSpreadsheet('1yrkkv0glVgKwOKtJQwIKDn_xS9Txe2eDmQ_Tg-DXo0w');

var sheet;
var sheet2;
var sheet3;

var itemSheet;

var itemRows;
var urlencodedParser = bodyParser.urlencoded({ extended: false })


/*
 * Setup the webserver.
 * Format routing.
 */
app.use(express.static('public'));
app.use(session({secret: 'hknsecret'}));
/*
app.get('/hknscan.html', function (req, res) {
    console.log("loaded login page");
    if(req.session.username){
    console.log(req.session.username);
        res.redirect("/buy.html" );
    }
    else {
        res.sendFile( __dirname + "/" + "hknscan.html" );
    }
})

app.get('/index.html', function (req, res) {
    console.log("loaded login page");
    if(req.session.username){
    console.log(req.session.username);
        res.redirect("/buy.html" );
    }
    else {
        res.sendFile( __dirname + "/" + "index.html" );
    }
})
app.get('/current_user', function (req, res) {
    res.send(req.session.username);
});

app.get('/current_id', function (req, res) {
    res.send(req.session.user_id);
});

app.get('/current_balance', function (req, res) {
    sheet.getRows({
      offset: 1,
    //  limit: 20,
    //  orderby: 'col2'
    }, function( err, rows ){
        console.log("userindex: "+req.session.userindex);
        console.log("debt-credit: "+rows[req.session.userindex]['debt-credit']);
        req.session.balance = rows[req.session.userindex]['debt-credit'];
        console.log("first: "+req.session.balance);
        res.send(req.session.balance);
    });
});

app.get('/login_status', function (req, res) {
    console.log("sending login status: "+req.session.loginSuccess);

    var responseObject = {
      "loginStatus": req.session.loginSuccess,
      "loginMessage": req.session.loginMessage
    };

    res.send(responseObject);
});

app.get('/register_status', function (req, res) {
    console.log("sending register status: "+req.session.registerSuccess);

    var responseObject = {
      "registerStatus": req.session.registerSuccess,
      "registerMessage": req.session.registerMessage
    };

    res.send(responseObject);
});



app.get('/logout', function (req, res) {
    console.log("logging out");
    req.session.destroy();
    res.send(true);
});

app.get('/register', function (req, res) {
    if(req.session.loginSuccess){
      req.session.user_id = null;
      req.session.username = null;
      req.session.userindex = null;
      //req.session.loginSuccess = false;
      console.log("manually clearing session");
    }
    console.log("register with this id: "+req.session.user_id);
    res.sendFile( __dirname + "/" + "register.html" );
});
*/

/*
 * Get /
 */
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
    console.log("loaded index.html");
});
/*
 * Get /parts
 */
app.get('/parts', function (req, res) {
    res.sendFile( __dirname + "/" + "parts.html" );
    console.log("loaded parts.html");
});


/*
 * Connect to google doc and get sheet.
 */
async.series([
  function setAuth(step) {
    // see notes below for authentication instructions!
    var creds = require('./google-generated-creds.json');

    doc.useServiceAccountAuth(creds, step);

  },
  function getInfoAndWorksheets(step) {
    doc.getInfo(function(err, info) {
      if(err) {
        console.log(err);
      }
      else {
        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet = info.worksheets[0];
        console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
        //itemSheet = info.worksheets[1];
      }
      step();
    });
  },
  function setAuth(step) {
    // see notes below for authentication instructions!
    var creds = require('./google-generated-creds.json');


    doc2.useServiceAccountAuth(creds, step);
  },
  function getInfoAndWorksheets(step) {
    doc2.getInfo(function(err, info) {
      if(err) {
        console.log(err);
      }
      else {
        console.log('Loaded doc: '+info.title+' by '+info.author.email);
        sheet2 = info.worksheets[0];
        sheet3 = info.worksheets[2];
        console.log('sheet 2: '+sheet2.title+' '+sheet2.rowCount+'x'+sheet2.colCount);
        //itemSheet = info.worksheets[1];
      }
      step();
    });
  },
  /*
  function getItemRows(step) {
    itemSheet.getRows({
      offset: 1,
    }, function( err, rows ){
      itemRows = rows;
      step()
    });
  }
  */
]);

app.post('/process_signin', urlencodedParser, function (req, res) {
  console.log("process signin starting ...");
  // Prepare output in JSON format
  response = {
    firstName:req.body.firstName,
    lastName:req.body.lastName
  };

  async.series([
    function trySignIn(callback) {

      // google provides some query options
      sheet.getRows({
        offset: 1,
      //  limit: 20,
      //  orderby: 'col2'
      }, function( err, rows ){

        var err1 = null;
        var foundId = false;
        var name = "";

        // loop over all users
        for (var i=0; i < rows.length; i++){


          // if found matching user
          if( response.firstName.toString().trim().toLowerCase() === rows[i].firstname.toString().trim().toLowerCase() && response.lastName.toString().trim().toLowerCase() === rows[i].lastname.toString().trim().toLowerCase()) {

            foundId = true;
            console.log("found matching id");

            //rows[i]['major'] = response.major.toString().trim();

            /*
            if (rows[i]['checked'] !== "Checked") {
              err1 = "Error: Problem with student registration.";
              rows[i]['signin'] = "denied";
              rows[i].save();
            }
            else{

              name += rows[i]['firstname'] + " " + rows[i]['lastname'];
              rows[i]['signin'] = Date().toString();
              rows[i].save();
            }
            */
            name += response.firstName + " " + response.lastName
            rows[i]['signin'] = Date().toString();
            rows[i].save();

            break;

          }
        }

        if (!foundId) {
          err1 = "Error: Student not registered.";
        }


        callback(err1, name);
      });
    }

  ],
  function(err, results) {

    signinMessage = "";

    if(err) {
      signinMessage = '<div class="alert alert-danger" roles="alert" id="signinMessage">Error: Student not registered.</div>';
    }
    else {
      signinMessage = '<div class="alert alert-success" roles="alert" id="signinMessage">Success! ' + results[0] + ' has been signed in.</div>';
    }

    res.send(signinMessage);

  });
  //res.end(JSON.stringify(response));
});

app.post('/process_part', urlencodedParser, function (req, res) {
  console.log("process part starting ...");
  // Prepare output in JSON format
  response = {
    groupName:req.body.groupName,
    partName:req.body.partName,
    checkOption:req.body.checkOption,
    partCount:req.body.partCount
  };


  var count = 0;
  if (response.checkOption === "checkout") {
     count = Number(-1 * response.partCount);
  }
  else {
    count = Number(response.partCount);
  }
  async.series([
    function trySignIn(callback) {
      sheet3.getRows({
        offset: 1,
      //  limit: 20,
      //  orderby: 'col2'
      }, function( err, rows ){

        var err1 = null;
        var foundPart = false;
        var name = "";

        // loop over all users
        for (var i=0; i < rows.length; i++){

          console.log(response.groupName + " vs "+ rows[i].teamname);
          console.log(response.partName + " vs "+ rows[i].partname);
          // if found matching user
          if( response.groupName === rows[i].teamname && response.partName === rows[i].partname) {

            foundPart = true;
            console.log("found matching part entry");

            rows[i]['count'] = Number(rows[i]['count']) + count;
            rows[i].save();

            break;

          }
        }

        if (!foundPart) {

          sheet3.addRow({
              'teamname': response.groupName.toString().trim(),
              'partname': response.partName.toString().trim(),
              'count': count
          }, function(err){

            callback(err, "success");

          });
        }
        else {
          callback(err1, name);
        }

      });



       /*
      // google provides some query options
      sheet2.getRows({
        offset: 1,
      //  limit: 20,
      //  orderby: 'col2'
      }, function( err, rows ){

        var err1 = null;
        var foundId = false;
        var name = "";

        // loop over all users
        for (var i=0; i < rows.length; i++){


          // if found matching user
          if( response.firstName.toString().trim().toLowerCase() === rows[i].firstname.toString().trim().toLowerCase() && response.lastName.toString().trim().toLowerCase() === rows[i].lastname.toString().trim().toLowerCase()) {

            foundId = true;
            console.log("found matching id");

            name += response.firstName + " " + response.lastName
            rows[i]['signin'] = Date().toString();
            rows[i].save();

            break;

          }
        }

        if (!foundId) {
          err1 = "Error: Student not registered.";
        }


        callback(err1, name);

      });
      */
    }

  ],
  function(err, results) {

    signinMessage = "";

    if(err) {
      signinMessage = '<div class="alert alert-danger" roles="alert" id="signinMessage">Error: Submission was not recorded.</div>';
    }
    else {
      signinMessage = '<div class="alert alert-success" roles="alert" id="signinMessage">Success! Submission recorded.</div>';
    }

    res.send(signinMessage);

  });
  //res.end(JSON.stringify(response));

});

app.get('/get_groups', function (req, res) {
    sheet.getRows({
      offset: 1,
    //  limit: 20,
      orderby: 'teamname'
    }, function( err, rows ){
        var groupNames = [];
        var currentGroup = "";
        for (var i = 0; i < rows.length; i++ ){
            if (rows[i]['teamname'].trim().toLowerCase() !== currentGroup.toLowerCase()) {
              currentGroup = rows[i]['teamname']
              groupNames.push(currentGroup);
            }
        }


        res.send(groupNames);
    });
});

app.get('/get_parts', function (req, res) {
    sheet2.getRows({
      offset: 1,
    //  limit: 20,
      orderby: 'part'
    }, function( err, rows ){
        var partNames = [];
        for (var i = 0; i < rows.length; i++ ){
          partNames.push(rows[i]['part']);
        }

        res.send(partNames);

    });
});


app.post('/process_registration', urlencodedParser, function (req, res) {
  console.log("process registration starting ...");

  // Prepare output in JSON format
  response = {
    userid:req.body.inputId,
    username:req.body.inputName,
    balance:req.body.inputBalance
  };

  /*
  req.session.user_id = response.userid.toString().trim();
  req.session.username = response.username.toString().trim();
  req.session.balance = response.balance.toString().trim();
  */

  async.series([

    function checkUser(callback) {
      sheet.getRows({
        offset: 1,
      }, function( err, rows ){
        var err1 = null;
        if (err) {
          err1 = err;
        }
        else {
          for (var i=0; i < rows.length; i++){
            if( response.userid.toString().trim() === rows[i].userid) {
              err1 = "Error: Duplicate user id."
            }
          }
        }
        callback(err1, "success");
      });

    },
    function tryRegister(callback) {

      sheet.addRow({
          'userid': response.userid.toString().trim(),
          'username': response.username.toString().trim(),
          'debt-credit': response.balance.toString().trim()
      }, function(err){

        callback(err, "success");

      });
    }

  ],
  function(err, results) {
    if (err) {
      req.session.registerSuccess = false;
      req.session.registerMessage = `<div class="alert alert-danger" role="alert">Problem creating new user.<br> `+err+`</div>`
      res.redirect("/register");
    }
    else {
      req.session.loginSuccess = false;
      req.session.registerSuccess = true;
      req.session.loginMessage = `<div class="alert alert-success" role="alert"><strong>Success!</strong> New user created. Please login.</div>`

      res.redirect("/");
    }

  });
  //res.end(JSON.stringify(response));
});

var server = app.listen(5555, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)

})
