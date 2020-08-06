
const dns = require('dns')

dns.lookup('windxpress.com', (err, address, family) => {
  console.log(address)
  console.log('address: %j family: IPv%s', address, family);
});
// address: "93.184.216.34" family: IPv4

dns.getServers()
var figlet = require('figlet');

let express = require('express')

var nodemailer = require('nodemailer');


let bodyParser = require('body-parser');

const morgan=require('morgan')
const mongoose = require('mongoose')


var mqtt = require('mqtt');

var client  = mqtt.connect('mqtt://48.101.114.216:1883',{ keepalive: 10,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  resubscribeOnReconnect: true});

var clienthtml = mqtt.connect('ws://48.101.114.216:1884',{ keepalive: 10,
  reschedulePings: true,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  resubscribeOnReconnect: true});
	

var mosca = require('mosca');

let app = express()


var urlencodedParser = bodyParser.urlencoded({extended:true});


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let apiRoutes=require("./api-routes")
app.use('/api',apiRoutes)


app.use(morgan('dev'))

Contact = require('./contactModel');
History = require('./HistoryModel')

var router=express.Router();

app.use(express.static('./public'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views',__dirname+'/public');


console.log(figlet.textSync('IDC LAB', {
      horizontalLayout: 'default',
      verticalLayout: 'default'
  }));
mongoose.connect('mongodb://localhost/NODE2', {useNewUrlParser: true});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.on('connecting',function(){
  console.log('Mongo DB connecting...')
})
db.once('open', function() {
  console.log("Mongo DB databse conected");
});

//MQTT

var settings = {
  port: 1883,
  http: {
    host: "48.101.114.216",
    port: 1884,
    bundle: true,
    static: './sensors'
  }
};



var server = new mosca.Server(settings);


server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});



server.on('published', function(packet, client) {
 console.log('Published', packet.payload.toString());
});


server.on('ready', setup);
// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}
client.on('disconnect',function(message){
	console.log('client disconnect:',message);
})
client.on('connect', function (clientConnected) {
	Users.find({},function(a,b){for(var i=0;i<b.length;i++){console.log(i);for(var e=0;e<b[i].Topics.length;e++){

	console.log('topic length:'+b[i].Topics.length+'  users length:'+b.length);var topic=b[i].Topics[e].type+'/'+b[i].Topics[e].location+'/'+b[i].Topics[e].topic;client.subscribe(topic,
function(err){if(!err){console.log('subscribe to topic:',topic)}})}}
  });
});
client.on('packetsend',function(packet){
	console.log('packetsend:',packet);
})


client.on('message', function (topic, message){
	console.log(topic)
    if(topic.split('/')[2] == "temperatura"){
      console.log(message.toString());
      var temp = message.toString().split('|')[1].toString().replace(/\./g, ',')
      console.log(temp)
      if(temp!=null&&temp!=NaN){
      Users.update({'Actuators.Type.SensorInfo.SensorDir': parseInt(message.toString().split('|')[0])},{$set:{'Actuators.$.Type.lastData':temp}},function(a,b){console.log(b)})
      };
      clienthtml.publish("temperatura", message.toString());
    } else if(topic.split('/')[2] == "Caudalimetro"){console.log('caudal:'+message.toString());
      var temp = message.toString().split('|')[1].toString().replace(/\./g, ',')
      console.log(temp)
      if(temp!=null&&temp!=NaN){
      Users.update({'Actuators.Type.SensorInfo.SensorDir': parseInt(message.toString().split('|')[0])},{$set:{'Actuators.$.Type.lastData':temp}},function(a,b){console.log(b)})
      };
      clienthtml.publish("temperatura", message.toString());

    } else if (topic.split("/")[2] =="Pulsadores"){
      Users.find({},function(err,res){
      var length = message.toString().length;var user;var method;var Actuator;
      console.log('message: '+message.toString());
      var Dir = message.toString().substr(0,length-1);
      var Es = parseInt(message.toString()[length-1])
 	
      var obj = find(res[0].Actuators,Dir,'dir');
      console.log(obj);
      if(Es == 0){
        method = 'OFF'
      } else if (Es == 1){
        method = 'ON'
      }
      updateActuator(Users,null,obj.Name,'Es',Es)
      console.log('Dir:',Dir+' Es:',Es);
  //    Users.update({'Actuators.Dir': Dir},{$set:{'Actuators.$.Es':Es}},function(err,res){
    //    console.log(res)		
      //})
      var info = {
        'User': user,
        'method': method,
        'date': new Date(),
        'ip': 'local',
        'Actuator': Actuator
        };

      updateHistory(info.User,info.method,info.date,info.ip,info.Actuator);
    });
  } else if(topic.split("/")[2]=="Accionadores"){
  	  console.log(message.toString())
      console.log(topic);
      var length = message.toString().length
      var user
      var method
      var Actuator
      console.log('message'+message.toString())
      var Dir = message.toString().substr(0,length-1);
      var Es = message.toString()[length-1]
       if(parseInt(Dir)==NaN||parseInt(Es)==NaN){
        Dir = message.toString().split('.')[0];
        Es = message.toString().split('.')[1];
      }
      if(Es == 0){
        method = 'OFF'
      } else if (Es == 1){
        method = 'ON'
      }

      } else if (topic=="mcu/BombaPruebas"){
        console.log('caudal:',message.toString())
        clienthtml.publish("temperatura", message.toString());
      }
  });

//---
client.on('error',function(error){
  console.log(error)
})
//--
app.get('/sensors',function(req,res){
  res.render('Sensors');

  clienthtml.subscribe('temperatura', function (err) {
    if (!err) {
       console.log("MQTT CONECTED TO HTML SERVER")   

    }
  })
 })


app.post('/sendmqtt', function(req,res){
  console.log(req.body)
  var info;var data = req.body;var length = data.value.length;var mqqtConect = true;
  var dir = parseInt(data.value.substring(0, length-1));
  console.log(dir);
  Users.find({},function(err,obj){
  var obj = find(obj[0].Actuators,dir,'dir')
  console.log('obj: '+JSON.stringify(obj))
  var topic = obj.topic
  var obj_es = obj.Es
  if(obj_es!=data.value[length-1]){
  console.log(req.body.value);
  console.log('changes');
  sendmqtt('/'+data.value+'/',topic);
  mqqtConect = true
  Users.update({'Actuators.Name': data.Actuator},{$set:{'Actuators.$.Es': data.value[data.value.length-1]}}, function(err,success){
  console.log(success);

  });
  
  if(data.value[length-1]=='1'){
  info = {
        'User': data.User,
        'method': 'ON',
        'date': data.date,
        'ip': data.ip,
        'Actuator': data.Actuator
      }
  } else if (data.value[length-1]=='0'){
  info = {
        'User': data.User,
        'method': 'OFF',
        'date': data.date,
        'ip': data.ip,
        'Actuator': data.Actuator
        }; 
  }
 console.log(info)
 updateHistory(info.User,info.method,info.date,info.ip,info.Actuator);
  res.end('success');
if(mqqtConect == false){
  res.end('mqttErr')
  var info ={
        'User': data.User,
        'method': 'MQTT ERROR',
        'date': data.date,
        'ip': data.ip,
        'Actuator': data.Actuator
        };

  updateHistory(info.User,info.method,info.date,info.ip,info.Actuator)
  
    }
      } else if(obj_es==data.value[length-1]){
        console.log('El estado es el mismo')
      } else {
        console.log('err')
      }
    })

   });
//views and login/register controller
app.post('/exit', function(req,res){
var data = req.body
res.send('cerrando sesion...')
Users.updateOne({Name: req.body.user},{ipaddress: ''}, function(err,success){if(err) handleError
    var info = JSON.stringify({
        'User': data.User,
        'method': 'exit',
        'date': data.date,
        'ip': data.ip,
        'Actuator': null
        });console.log(info);History.find({User: req.body.user}, function(err,history){
 History.updateOne({User: history[0].User}, {}, function(err,success){console.log(success);})})
});res.end()
});



app.get('/login',function(req,res){
   res.render('login')
});

app.get('/page', function(req,res){  
      res.render('page')
})


app.get('/',function(req,res){
  res.render('index') 
})

app.get('/LoginError', function(req,res){
  res.render('loginError')
})


Users = require('./usersModel');
Users.find ({"Actuators.Es":0},function(err,res){console.log(res)})

app.post('/getHistoryData', function(req,res){
console.log(req.body);
History.find({User: req.body.user}, function(err,result){
  console.log('result'+result)
  if(err){
    res.end(err)
  } else{ 
  console.log(result)
  res.end(JSON.stringify(result[0].info));
  }
})

})

app.get('/info',function(req,res){
  History.find({},function(err,info){
  res.send(info.toString())
  })
})
var authorizing = false


app.get('/History', function(req,res){

  res.render('history', {data: authorizing})

  if(authorizing==false){
    console.log('false')
  } else if (authorizing==true){
    console.log('true')
    authorizing = false
  }
});
app.post('/refreshHistory', function(req,res){
  var index = req.body.info;
  History.find({User: req.body.user},function(err,result){
  console.log(result[0].info);
  console.log(result[0].info);
  var HistoryLenth = result[0].info.User.length;
  var userArray = result[0].info.User;
  var methodArray = result[0].info.method;
  var dateArray = result[0].info.date;
  var ipArray = result[0].info.ip;
  var actuatorArray = result[0].info.Actuator;
  console.log(index.length);
  for(var i=0; i<index.length; i++){
  console.log(index[i]);
  userArray[index[i]] = 'remove';
  methodArray[index[i]] = 'remove';
  dateArray[index[i]] = 'remove';
  ipArray[index[i]] = 'remove';
  actuatorArray[index[i]] = 'remove';
  console.log('user: '+userArray[index[i]])
  console.log('ip: '+ipArray[index[i]])
  console.log('date: '+dateArray[index[i]])
  console.log('methods: '+methodArray[index[i]])

}
  userArray = userArray.filter(function (user) { 
    return user != 'remove';
    });
  methodArray = methodArray.filter(function (method) { 
    return method != 'remove';
    });
  dateArray = dateArray.filter(function (date) { 
    return date != 'remove';
    });
  ipArray = ipArray.filter(function (ip) { 
    return ip != 'remove';
    });
  actuatorArray = actuatorArray.filter(function (actuator) { 
    console.log('actuator:'+actuator)
    return actuator != 'remove';
    });
  History.updateOne({User: req.body.user},{$set:{'info.User': userArray,'info.method': methodArray, 'info.date': dateArray, 'info.ip': ipArray, 'info.Actuator':actuatorArray}},function(err,success){
    setTimeout(()=>{    res.send('success');   },500);
    console.log(success);
    authorizing = true
      });
    });
});




app.post('/authorizing', function(req,res){

  if(req.body.User == null){
    res.end('err');
    authorizing = false;
  } else if (req.body.User != null){
    res.end('success');
    console.log('success');
    authorizing = true;
  }
});
app.post('/loginUser',urlencodedParser,function(req,res){
Users.find({Name: req.body.Name}, function(err, user){
     if(JSON.stringify(user)== '[]'){
               res.end("err");
            } else if (user[0]!=null && user[0].Name === req.body.Name && user[0].pass === req.body.Pass){
            setTimeout(()=>{
            console.log("Succes!")
            Users.find({ipaddress: req.body.ip},function(err,result){
              if(JSON.stringify(result)!='[]' && result[0]!=req.body.Name){
                Users.updateOne({Name: result[0].Name}, {ipaddress: ''}, function(err,success){
                  console.log('cambiando sesión')
                  console.log(success)
                })
              }
            })
            Users.updateOne({Name: user[0].Name},{ipaddress: req.body.ip},function(err,success){
              console.log(success)

            });

            res.end(JSON.stringify(user[0].Name))  
            }, 2000)
          } else {
            console.log("Credentials wrong");
            res.end("err");
          }

        });

  });
app.post('/registerUser', urlencodedParser,function(req,res){
  Users.find({name:req.body.Name}, function(err,user){
    console.log(req.body.Name)
    console.log(user)
    if(JSON.stringify(user)!='[]'){
      res.end('err')
    }
    if(JSON.stringify(user)=='[]'){
      loginData=req.body 
  var users = new Users();
    users.Name = req.body.Name ? req.body.Name : users.Name;
    users.email = req.body.email;
    users.pass = req.body.password;
    console.log("añadiendo:  "+req.body.Name+"  "+req.body.email+"  "+req.body.password)
    res.end(JSON.stringify({'user': req.body.Name}))
// save the contact and check for errors
    users.save(function (err) {
    History.create({User: req.body.Name, info: ''},function(err,success){
      if(err) handleError
      console.log(success)
    });
    History.updateOne({User:req.body.Name},{$set:{'info.User': [req.body.User],'info.method': ['create'], 'info.date': [new Date()], 'info.ip': [null], 'info.Actuator': [null]}},function(err,update){
        console.log('Historial creado')
    })
    });

    }
  })


})
Alarms = require('./AlarmModel')
var alarm = []
app.post('/alarm', urlencodedParser, function(req,res){
    var AlarmsDATA = [];var AlarmDay = req.body.day;var AlarmHour = req.body.Hour;var Actuators = req.body.Objects;var Directions = [];var method = req.body.method;var index = '';
    console.log('Actuators'+Actuators)
    for(var i = 0; i<Actuators.length; i++){
      Directions[i] = Actuators[i].split(',')[1]; 
    }
    Users.find({Name: req.body.User},function(a,b){
    	if(!a){
    		var alarms=b[0].Alarms;console.log(alarms); var index=cheeck();if(AlarmDay == undefined || method == null || Directions == undefined){
    		res.status(300).res('Debe introducir una hora y un dia validos');
    	} else {
    	console.log(index);
    	console.log('Creando alarma del usuario:',req.body.User+'...'); 
    	var TimeSplit = AlarmHour.split(":");
    	var hours = correctHours(TimeSplit[0]);
    	var minutes = TimeSplit[1]; var day=getDay(AlarmDay,hours,minutes);
		var a = [];var minutes = TimeSplit[1];a[index] = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+day ,hours, minutes, 0, 0);
    	alarm[index] = setInterval(()=>{timeOut(a[index],method,Directions,req.body.User,index,true,alarm)}, 1000); var data ={'Actuators':Actuators, 'Es':'ON', 'index':index,'day':AlarmDay,'hour':hours,'minutes':minutes,'Dirs':Directions,'method':method};
    	Users.update({Name:req.body.User},{$push:{Alarms:data}},function(a,b){console.log(b);res.end(JSON.stringify(data));
})}}})});


function cheeck(){
	var number = Math.floor(Math.random() * 1000000);
	if(alarm[number]!=null || alarm[number]!=undefined || alarm[number]!='empty'){
		return number;
	} else {
		number = cheeck();
		return number;
	}
}


app.post('/AlarmStatus', function(req,res){
  console.log(req.body);
  Users.update({'Alarms.index': parseInt(req.body.index)},{$set:{'Alarms.$.Es': req.body.method}}, function(err,result){
    if(err)
      res.send(err);
    console.log(result)
    res.end()
  })
})
app.post('/getDataSensors',function(req,res){
  console.log(req.body)
  Users.find({Name: req.body.user},function(err,obj){
    var obj = obj[0]
    var sensors = [];
    var e = 0
    console.log(obj)
    console.log(obj.Actuators[1].Type.data)
    for(var i=0;i<obj.Actuators.length;i++){
      console.log(obj.Actuators[i].Type.withSensor)
      if(obj.Actuators[i].Type.withSensor==true){
        
        sensors[e] = {'Name':obj.Actuators[i].Type.SensorInfo.SensorName, 'Dir':obj.Actuators[i].Type.SensorInfo.SensorDir, 'data': obj.Actuators[i].Type.data};
        e++
        console.log(sensors)
      }
    }
  res.send(JSON.stringify(sensors)).status(200);
  })
})


//-----------------------------------------------------------//

 app.listen(8080,()=>{console.log('server on port 8080')})

app.post('/deleteAlarms', function(req,res){
Users.find({Name:req.body.User},function(a,b){if(b[0].Alarms.length!=0){for(var i=0;i<b[0].Alarms.length;i++){clearInterval(alarm[b[0].Alarms[i].index])}}})
deleteAlarms(req.body.User);
res.end()

})

app.post('/refreshConsumeAll', function(req,res){
  Contact.find({}, function(err,obj){
    console.log(obj)
    var consume = []
    var directions = []
    var names = []
    if(err) handleError
    for(var i = 0; i<obj.length; i++){
    consume[i] = obj[i].Consume;
    directions[i] = obj[i].direction;
    names[i] = obj[i].Name
    }
    console.log(consume)
    console.log(directions)
    console.log(names)
    var data = {'Consume': JSON.stringify(consume), 'Directions': JSON.stringify(directions), 'Names': JSON.stringify(names)}
    res.end(JSON.stringify(data))

  })


})

app.post('/graphs',function(req,res){
Contact.find({},function(err,result){
  var a = []
for(var i = 0; i<result.length-1; i++){
  a[i] = {Y:parseInt(result[i].Consume), label: result[i].Name}
  console.log(a) 
  res.end(JSON.stringify(a))
    };
});}) 
var Sampleinterval=[];
app.post('/takeSamples',urlencodedParser,function(req,res){
	console.log(req.body);
	Users.find({Name:req.body.user},function(a,b){console.log(b[0].Actuators);var sensor=find(b[0].Actuators,req.body.sensor,'sensor');var dir=sensor.SensorInfo.SensorDir;console.log(dir); var date= new Date().getDate()+req.body.time;
	clearInterval(Sampleinterval[dir]);Users.update({'Actuators.Type.SensorInfo.SensorDir':dir},{$set:{'Actuators.$.Type.data.Data': [],'Actuators.$.Type.data.time':[]}},function(a,b){console.log(b)});Sampleinterval[dir] = setInterval(()=>{takeSamples(date,dir,req.body.user,req.body.sensor)},req.body.interval)
		});
});
function takeSamples(time,dir,user,sensorName){
	var now=new Date().getDate();
	Users.find({Name:user},function(e,m){console.log(m[0].Actuators);var sensor=find(m[0].Actuators,sensorName,'sensor');
	if(time-now>0){Users.update({'Actuators.Type.SensorInfo.SensorDir':dir},{$push:{'Actuators.$.Type.data.Data':sensor.lastData,'Actuators.$.Type.data.time': new Date()}},function(a,b){console.log(b)})}
})}

app.post('/viewSamples',function(req,res){
	Users.find({Name:req.body.user},function(a,b){var sensor=find(b[0].Actuators,req.body.sensor,'sensor');var toSend=[] ;for(var i=0;i<sensor.data.time.length;i++){toSend[i]={'time':sensor.data.time[i],'sample':sensor.data.Data[i]}} res.end(JSON.stringify(toSend))})
})

app.post('/getDataUser', function(req,res){  
      //search sessions with ip address
      Users.find({ipaddress:req.body.ip},function(err,ressult){
        console.log(ressult)
        console.log(req.body)
        if(JSON.stringify(ressult)=='[]'){
          console.log("no hay ninguna sesión con esta direccion ip o usuario")
          res.end('err')
        }
       else if (JSON.stringify(ressult)!='[]' && JSON.stringify(ressult[0].Name)===JSON.stringify(req.body.user)){
        console.log("El usuario ya tiene una sesion iniciada")
        console.log(ressult)
         History.find({User: ressult[0].Name}, function(err,history){
          console.log(history)
         var info ={
        'User': ressult[0].Name,
        'method': 'enter',
        'date': new Date(),
        'ip': req.body.ip,
        'Actuator': null
        }
         console.log(info.User);
        updateHistory(info.User,info.method,info.date,info.ip,info.Actuator);
        })
      } else if (JSON.stringify(ressult)!='[]' && JSON.stringify(ressult[0].Name)!=JSON.stringify(req.body.user)){
        History.find({User: ressult[0].Name}, function(err,history){
         var info = {
        'User': ressult[0].Name,
        'method': 'enter',
        'date': new Date(),
        'ip': req.body.ip,
        'Actuator': null
        }
         console.log(info);
           updateHistory(info.User,info.method,info.date,info.ip,info.Actuator);
        })
        console.log("El usuario no tiene una sesion inicia pero si existe una registrada a al direccion IP")
        res.end(JSON.stringify({request: 'find', user: JSON.stringify(ressult[0].Name) }))
      };
    });
      Users.find({Name:req.body.user}, function(err,objects){
        console.log('actuators:',objects);
        var obj = []
        console.log(objects)
        for(var i=0; i<objects[0].Actuators.length;i++){
        console.log(i)
        obj[i] = {'Name':objects[0].Actuators[i].Name, 'direction':objects[0].Actuators[i].Dir, 'Es': objects[0].Actuators[i].Es, 'Class': objects[0].Actuators[i].Type.Class}
      }
      console.log('obj:',obj)
      Users.find({Name:req.body.user}, function(err,alarms){
      var alarms = alarms[0].Alarms;
      console.log('alarms:',alarms)
      if(JSON.stringify(objects[0].Actuators)=='[]'){
      res.end('clear');  
      } else if (JSON.stringify(objects.Actuators)!='[]' && objects!=null){

      res.end(JSON.stringify({'Objects': JSON.stringify(obj), 'Alarms': JSON.stringify(alarms)}));
        }});
    });
    
});

function addObject (Name,dir,Es,Class,withSensor,SensorName,SensorDir,Time,Data,User){
  var Name=Name; var dir=dir;var Es=Es; var Class=Class; var withSensor=withSensor; var SensorName=SensorName; var SensorDir=SensorDir; var Time=Time; var Data=Data; var User=User; 
    if(withSensor==false){SensorName = null;SensorDir = null;Time = null;Data = null;};console.log(User);
    var data = {'Name':Name, 'Dir': dir, 'Es': Es, 'updateDate': new Date(), 'Type':{'withSensor': withSensor, 'SensorInfo': {'SensorName': SensorName, 'SensorDir': SensorDir}, 'data': {'time': Time, 'Data': Data}, 'lastData': undefined}, 'Class': Class};console.log(data);Users.update({Name: User},{$push:{Actuators: data}},function(err,success){
    if(err){console.log(err);
    } else if(!err){
console.log('res',success);console.log('success')}});};
function updateHistory(User,method,date,ip,Actuator){console.log(User+method+date+ip+Actuator);console.log(findModel(History));  
  History.updateOne({User: User},{$push:{'info.User': User,'info.method': method, 'info.date': date, 'info.ip': ip, 'info.Actuator': Actuator}},function(err,success){console.log('History Update result:',success);
      })}; function findModel(model,options){model.find({},function(a,b){ if(options==null){console.log('model:',b)}else if(options=='Topics'){console.log('model',b[0].Topics)}else if(options=='Actuators'){console.log('model',b[0].Actuators)}})};
function deleteObject(NameObject){
	if(NameObject==null){console.log('error')}else{Users.find({'Actuators.Name':NameObject},function(a,b){if(!a){Users.delete({'Actuators.Name':NameObject},function(c,d){console.log(d)})}})
}};function deleteModel(object){var Model = object;Model.deleteMany({},function(err,res){console.log(res);console.log('modelo eliminado');});};
function updateActuator (model,find,toChange,target,change){
model.find({},function(a,b){console.log(b)})
	if(model==null||toChange==null||change==null){
		console.log('Debe especificar bien los valores');
	} else{ console.log(target); if(target=='Es'){{model.find({},function(a,b){if(a){console.log('error',a)}else if(!a || b.length!=0){model.update({'Actuators.Name':toChange},{$set: {'Actuators.$.Es':change}},function(c,d){if(!c){console.log('callback:',d)}})}})}
			} else if(target=='Dir'){console.log('target is',target);model.find({},function(a,b){if(a){console.log('error',a)}else if(!a || b.length!=0){model.update({'Actuators.Name':toChange},{$set: {'Actuators.$.Dir':change}},function(c,d){if(!c){console.log('callback:',d)}})}})
}}};
function sendmqtt(message,topic){if(topic=='tomaslazolazo1994'){var msg = message;client.publish('tomaslazolazo1994', '/'+msg+'/')
}else{client.publish(topic,message)}};
sendmqttWithDir(23,'/'+230+'/');
function sendmqttWithDir(dir,message){if(dir==null || message==null ){console.log('err')}else{Users.find({},function(err,res){ var obj = find(res[0].Actuators,dir,'dir');
      console.log(message); client.publish(obj.topic,message)})}}
function topic(user,topic,type,location){
if(user==null||topic==null){console.log('error');}else{Users.update({'Name':user},{$push: {'Topics': {'topic': topic, 'type':type, 'location':location}}},function(a,b){if(a){console.log('err',a)}else if(!a){console.log('request:',b)}})}};
function getDataOfModel (model,target1,target2){
 var result=[];model.find({},function(a,b){for(var i=1;i<b.length+1;i++){result[i-1]=JSON.stringify(b[0].Actuators[i])}});console.log(result);return result};
function addTopic (user,actuator,topic){
	Users.find({Name:user},function(a,b){if(a){console.log(a)}else if(b[0]==null){console.log('objeto no encontrado')} else{
		Users.update({'Actuators.Name':actuator},{$set:{'Actuators.$.topic': topic}},function(c,d){if(c){console.log('error')}else{console.log(d)}})
	}})};

function find(obj,tag,type){if(obj==undefined||tag==undefined){return undefined} else {if(type=='dir'){
	for(var i=0; i<obj.length;i++)
		{if(obj[i].Dir==tag){console.log('find');return obj[i]}}}else if(type=='index'){for(var i=0;i<obj.length;i++){
	if(obj[i].index==tag){return obj[i]}}} else if(type=='sensor'){console.log(obj[i]);for(var e=0;e<obj.length;e++){console.log('tag:'+tag+'type:'+type);if(obj[e].Type.withSensor==true){if(obj[e].Type.SensorInfo.SensorName==tag){return obj[e].Type}}}}
}};


function getDay(day,hour,minutes){
var d= new Date().getDay();var weekday = new Array(7);weekday[0] = "Sunday";weekday[1] = "Monday";weekday[2] = "Tuesday"; weekday[3] = "Wednesday";weekday[4] = "Thursday";weekday[5] = "Friday";weekday[6] = "Saturday"; 
for (var i=0; i <7 ; i++){if (weekday[i] == day){var weekdayNumber = i};var differentDay = (weekdayNumber - d);if (differentDay<0){differentDay = differentDay+7}; if((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+day ,hour, minutes, 0, 0)-new Date().getTime())<60000 || differentDay==0){differentDay=differentDay+6};return differentDay;}}
function correctHours(hours){var meridian; var meridianValue = 0;if (hours > 12) { meridian = 'PM'; hours -= 12; meridianValue=12;} else if (hours < 12) {meridian = 'AM';if (hours == 0) {hours = 12;meridianValue = 0;};} else {meridian = 'PM';meridianValue = 12;};return parseInt(hours)+meridianValue;
};
function timeOut(date,method,dir,user,index,loop,times){
		var times = true;
		console.log(times);
		if(times==true){
        var currents_hours = date.getHours();
        var currents_minutes = date.getMinutes();
        var now = new Date().getTime();
        var distance = (date - now);
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        console.log(days+"d"+hours+"h"+minutes+"m"+seconds+"s");
  if (distance < 0 && times==true) {
       Users.find({Name:user},function(a,b){
       if(b[0].Alarms.length!=0){
       times = false;
 	   console.log('index',index);
       var data = find(b[0].Alarms,index,'index');
       console.log('finalizado...');
       if(data.Es=='OFF'){console.log('Alarma desactivada')}else if(data.Es=='ON'){for(var i=0;i<dir.length;i++){sendmqttWithDir(dir[i],'/'+dir[i]+method+'/')}}
       if(loop==true);{console.log('Repitiendo alarma...');var newdate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+7 , currents_hours, currents_minutes, 0, 0); clearInterval(alarm[index]); console.log(index);alarm[index]=setInterval(()=>{timeOut(newdate,method,dir,user,index,loop)},1000);
       }}});
  };
};
};
function run_Alarm(delay,index,User){setTimeout(()=>{Users.find({Name:User},function(a,b){var data = find(b[0].Alarms,index,'index'); console.log(data); alarm[index]=setInterval(()=>{timeOut(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+getDay(data.day,data.hour,data.minutes) ,data.hour, data.minutes, 0, 0),data.method,data.Dirs,User,index,true,0)},1000)})},delay)}
function deleteAlarms(user){Users.update({Name:user},{$set:{Alarms:[]}},function(a,b){console.log(b)})}
function run_All_Alarms (user) {
	Users.find({Name:user},function(a,b){const model = b[0].Alarms;var delay;for(var i=0;i<model.length;i++){delay=i*1000;run_Alarm(delay,b[0].Alarms[i].index,user)}})
};
//run_All_Alarms('Tomas Lazo');//findModel(Users,'Actuators')//addObject('Bomba Pruebas',23,0,'Luz',false,null,null,null,null,'Tomas Lazo')

