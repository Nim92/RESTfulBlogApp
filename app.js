var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose = require("mongoose"),
express = require("express"),
app = express();
	
// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app", { useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useFindAndModify', false);
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(express.static("public"));
app.set("view engine", "ejs");

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


//RESTful ROUTES
app.get("/", function(req, res){
	res.redirect("/blogs");
});

// INDEX
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("ERROR");
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// CREATE
app.post("/blogs", function(req, res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		} else {
			//then, redirect to the index
			res.redirect("/blogs")
		}
	});
	
});


// SHOW
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err)
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	})
});


// EDIT
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});


//Update
app.put("/blogs/:id", function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// DELETE
app.delete("/blogs/:id", function(req, res){
	//Destroy blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else{
			res.redirect("/blogs");
		}
	});
	//redirect
});


app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("The server has started!");
});