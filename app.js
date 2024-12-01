//==========ALL PACKAGES ARE ADD HERE +==========//
const express = require('express')
const app = express()
const passport=require("passport");
const engine = require('ejs-mate');
const methodOverride = require('method-override')
const path = require("path");
const listing = require("./models/listing.js")
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user.js');
const Reviews = require("./models/reviews.js")
const session = require('express-session')
const ExpressError =require("./util/ExpressError.js");
const wp =require("./util/wraperror.js");
const flash = require('connect-flash');

const mongoose = require('mongoose');
const user = require('./models/user.js');
//========ALL MIDDLEWARE ARE HERE ============//
const port = 3000
app.use(express.static(path.join(__dirname,"public")));
app.engine('ejs', engine);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"))
main().then((res) => {
  console.log("database connect");
})

  .catch(err => console.log(err));
 
  app.use(methodOverride('_method'))
  app.set('view engine', 'ejs');
// ======DAtABASE CONNETCION MAIN FUNCTION
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/room');
}
//=====DEFINE SESSION HERE ====//

const sessionoption = {
  secret: 'SUPERCODE',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
       
    httpOnly: true,    
    maxAge: 24 * 60 * 60 * 1000, 
   
  }
};
app.get('/', (req, res,next) => { 
  res.render("listing/home.ejs")
  }
)
app.use(session(sessionoption));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  next();
});
//====passport and userAuth====//
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); // Ensure you're using 'User' instead of 'user'

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =======ROOT ROUNT======//


app.get("/listing", wp(async (req, res,next) => {
  const listdata = await listing.find({});
  res.render("listing/index.ejs", { listdata });

}));
app.post("/listing",wp(async (req,res,next)=>{
  new listing(req.body.listing).save();
  req.flash("success", "This listing is created");

  res.redirect("/listing");
}));

app.get("/listing/new",(req,res)=>{
  res.render("listing/new.ejs")
});

app.get("/listing/:id/edit", wp(async (req, res,next) => {
  const { id } = req.params;
  const data = await listing.findById(id);
  res.render("listing/edit.ejs",{data})
 
}));
//=====userSign up ====//
app.get("/sinup",(req,res)=>{
  res.render("user/sinup")
})
app.post("/sinup", wp(async (req, res) => {
  let { username, email, password } = req.body; // Ensure these match your form
  if (!username) {
      req.flash("error", "No username was given."); // Flash error if username is missing
      return res.redirect("/sinup");
  }
  
  const newUser = new User({ email, username });
  await User.register(newUser, password);
  req.flash("success", "User registered successfully!");
  res.redirect("/listing");
}));
//=====user log in ====//
app.get("/login",(req,res)=>{
  res.render("user/login.ejs");
})
app.post("/login", passport.authenticate('local', { 
  failureRedirect: '/login', 
  failureFlash: 'Invalid username or password. Please try again.' 
}), async (req, res) => {
  // Flash message for successful login
  req.flash("success", "Welcome back, " + req.user.username + "!");
  
  // Redirect to the desired page after successful login
  res.redirect("/listing");
});
app.put("/listing/:id", wp(async (req, res, next) => {
  
      const { id } = req.params;

      if (!req.body.listing) {
          throw new ExpressError(404);
      }

      // Find the listing by ID and throw an error if it doesn't exist
      const listing = await Listing.findById(id);
      if (!listing) {
          throw new ExpressError(404, "Listing not found");
      }

      await listing.findByIdAndUpdate(id, { ...req.body.listing });

      res.redirect("/listing/" + id);
  
}));
app.delete("/listing/:id",wp(async (req,res,next)=>{
  const { id } = req.params;
  const data = await listing.findByIdAndDelete(id);
  res.redirect("/listing");
 
}));
app.get("/listing/:id", wp(async (req, res,next) => {
  const { id } = req.params;
  const data = await listing.findById(id).populate('reviews');
  res.render("listing/show.ejs", { data });
 

}));
// reviews post rount
app.post("/listing/:_id/reviews",wp(async(req,res,next)=>{
  const listdata = await listing.findById(req.params._id);
  const newReview= await Reviews(req.body.Review);
  listdata.reviews.push(newReview);
  await newReview.save();
  await listdata.save();
  res.redirect(`/listing/${listdata._id}`)


}));
app.delete("/listing/:id/reviews/:reviewId", wp(async (req, res) => {
  const { id, reviewId } = req.params;

  // Pull the review ID from the listing's reviews array
  await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  
  // Delete the review document itself
  await Reviews.findByIdAndDelete(reviewId);

  res.redirect(`/listing/${id}`);
}));
app.all("*",(req,res,next)=>{
   next(new ExpressError(404,"This is not you page"));
})
app.use((err,req,res,next)=>{
  let {status=404,message="this is not your page"}=err;
 
  res.render("listing/err.ejs",{status,message});
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
