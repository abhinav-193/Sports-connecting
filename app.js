//dependencies

const env = require("./environment.js");
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Event = require('./models/event')
const User = require('./models/user')
const Going = require('./models/going')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { requireAuth,checkUser } = require('./middleware/authMiddleware');
const request = require('request');
var favicon = require('serve-favicon');

//app
const app = express();

//Mongo connection and listen
const dbURI = env.MONGO_URI;
mongoose.connect(dbURI, {useNewUrlParser:true,useUnifiedTopology:true})
    .then((result)=> {
        console.log('Connected to DB');
        //listening
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => console.log(err));



//view engine
app.set('view engine','ejs')

//middleware
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

//icons
const thumbs = {
    Cricket: '<span class="material-icons">sports_cricket</span>',
     Football:'<i class="fas fa-futbol"></i>',
     Tennis:'<span class="material-icons">sports_tennis</span>',
     Badminton:'<img src="/icons/badminton.svg" alt="">',
     Volleyball:'<i class="fas fa-volleyball-ball"></i>',
     Basketball:'<i class="fas fa-basketball-ball"></i>',
     Hockey:'<span class="material-icons">sports_hockey</span>',
     Running:'<i class="fas fa-running"></i>',
     Workout:'<span class="material-icons">fitness_center</span>'
   };

//Sandbox routes
app.post('/add-event',(req,res)=>{
     const event = new Event(req.body);
     event.save()
         .then((result)=>{
             res.redirect(`/details/${result._id}`)
        })
        .catch((err)=>{
             console.log(err);
        });
 })

app.get('/all-event',async (req,res)=>{
    await Event.find()
        .then((result)=>{
           res.send(result);
        })
        .catch((err)=>{
            console.log(err);
        });
})

//jsonwebtoken
const maxAge = 1 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({id},env.JWT_SECRET,{expiresIn:maxAge});
}

//login status
app.get('*',checkUser);

//routes
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/find',requireAuth,async (req,res)=>{
    let events;
    await Event.find().sort({createdAt: -1})
        .then((result)=>{
            events=result;
        })
        .catch((err)=>{
            console.log(err);
        });
    res.render('find',{api_key:env.GOOGLE_API_KEY,events:events,fakey:env.FONT_KEY,thumbs:thumbs})
})

app.get('/details/:id',requireAuth,async (req,res)=>{
    let events,address;
    await Event.findById(req.params.id)
        .then(async(result)=>{
               await request(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${result.lat},${result.lng}&key=${env.GOOGLE_API_KEY}`, { json: true }, (err, response, body) => {
                    if (err) { return console.log(err); }
                    address = body.results[0].formatted_address;
                    console.log(address);
                    events=result;
                    res.render('details',{api_key:env.GOOGLE_API_KEY,events:events,fakey:env.FONT_KEY,thumbs:thumbs,address:address})
                  });
        })
        .catch((err)=>{
            console.log(err);
        });
})

app.get('/event',requireAuth,(req,res)=>{
    res.render('event',{api_key:env.GOOGLE_API_KEY})
})

app.get('/find/:activity&:datetime',requireAuth,async (req,res)=>{
    var activity = req.params.activity;
    var datetime = req.params.datetime;
    var dates = datetime.split(" - ");
    var st = new Date(dates[0]);
    var en = new Date(dates[1]);
    st.setDate(st.getDate());
    en.setDate(en.getDate()+1);
    st = st.getTime();
    en = en.getTime();
    let events=[];
    await Event.find().sort({start: 1})
        .then((result)=>{
            result.forEach(element => {
                if(element.start.getTime()>=st && element.start.getTime()<=en && (activity=="Any" || element.activity==activity)) 
                {
                    events.push(element);
                }
            });
        })
        .catch((err)=>{
            console.log(err);
        });
       
    res.render('find',{api_key:env.GOOGLE_API_KEY,events:events,fakey:env.FONT_KEY,thumbs:thumbs})
})

app.post('/add-going/',requireAuth,async (req,res)=>{
    const {event,email} = req.body;
    try{
        const going = await Going.add(event, email);
        res.send(going);
    }
    catch{
        const going = new Going({
            event:event,
            email:email
        });
        going.save()
        .then(async(result)=>{
            await Going.find({event:result.event})
            .then(async (result)=>{
                const sz = result.length;
                console.log(sz);
                await Event.updateOne({ _id: event }, {going : sz});
            })
            res.send(result);
        })
        .catch((err)=>{
            console.log(err);
        });
    }
})


//auth Routes

app.get('/login',(req,res)=>{
    res.render('login',{sawo_key:env.SAWO_KEY})
})

app.get('/logout',(req,res)=>{
    res.cookie('jwt','',{maxAge:1});
    res.redirect('/');
})

app.post('/add-user',async (req,res)=>{
    const {user_id,email} = req.body;
    try{
        const user = await User.login(user_id, email);
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge: maxAge*1000});
        res.send(user);
    }
    catch{
        const user = new User({
            user_id:user_id,
            email:email
        });
        user.save()
        .then((result)=>{
            const token = createToken(result._id);
            res.cookie('jwt',token,{httpOnly:true,maxAge: maxAge*1000});
            res.send(result);
        })
        .catch((err)=>{
            console.log(err);
        });
    }
})