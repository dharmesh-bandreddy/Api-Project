const express = require("express");
const mongoose = require("mongoose");
var bodyParser= require("body-parser"); //need for host request
require("dotenv").config();

//Datebase
const database= require("./database/database");
const { author } = require("./database/database");

//Models
const BookModel = require("./database/book");
const AuthorModel =require("./database/author");
const PublicationModel =require("./database/publication");

//initialize express
const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL).then(()=>console.log("Connection established"))
/*
Route           /
Description     Get all the books
Access          PUBLIC
Parameter       NONE
Methods         GET
*/

// booky.get("/",(req,res)=>{
//     return res.json({books: database.books}) //traditonal methods
// });

booky.get("/",async (req,res)=>{
    const getAllBooks = await BookModel.find();
    return res.json(getAllBooks)
});

/*
Route           /is
Description     Get specific book on isbn 
Access          PUBLIC
Parameter       isbn
Methods         GET
*/

booky.get("/is/:isbn",async(req,res)=>{

    const getSpecificBook = await BookModel.findOne({ISBN: req.params.isbn});
    //null
    if(!getSpecificBook){
        return res.json({error:`No book found for the ISBN of ${req.params.isbn}`})
    }
    return res.json({book: getSpecificBook})
});
/*
Route           /c
Description     Get all authors
Access          PUBLIC
Parameter       category
Methods         GET
*/

booky.get("/c/:category",async(req,res)=>{
    const getSpecificBook = await BookModel.findOne({category: req.params.category});
    //null
    if(!getSpecificBook){
        return res.json({error:`No book found for the category of ${req.params.category}`})
    }
    return res.json({book:getSpecificBook});
});


booky.get("/l/:language",(req,res)=>{
    const getSpecificBook = database.books.filter(
        (book)=> book.language.includes(req.params.language)
    )
    if(getSpecificBook.length===0){
        return res.json({error:`No book found for the language ${req.params.language}`})
    }
    return res.json({book:getSpecificBook});
})

/*
Route           /author
Description     Get all authors
Access          PUBLIC
Parameter       NONE
Methods         GET
*/

booky.get("/author",async(req,res)=>{
    const getAllAuthors = await AuthorModel.find();
    return res.json(getAllAuthors);
})
booky.get("/author/s/:id",(req,res)=>{
   
   
   const getSpecificId=database.author.find(
        (author)=>author.id==req.params.id
        
    )
    if(!(getSpecificId)){
        return res.json({error:`No author found at ID ${req.params.id}`})
    }
    return res.json({authors:getSpecificId});
})

booky.get("/author/s/:name",(req,res)=>{
    const getSpecificauthor = database.author.filter(
        (author) => author.name.includes(req.params.name)
    )
    if(getSpecificauthor.length===0){
        return res.json({error:`No author found at name ${req.params.name}`})
    }
    return res.json({authors:getSpecificauthor});
})


booky.get("/author/book/:isbn", (req,res) => {
    const getSpecificAuthor = database.author.filter(
      (author) => author.books.includes(req.params.isbn)
    )
  
    if(getSpecificAuthor.length === 0){
      return res.json({
        error: `No author found for the book of ${req.params.isbn}`});
    }
    return res.json({authors: getSpecificAuthor});
});

booky.get("/publications",async(req,res)=>{
    const getAllPublications = await PublicationModel.find();
    return res.json(getAllPublications)
    })

    //POST

/*
Route           /book/new
Description     Add new book
Access          PUBLIC
Parameter       NONE
Methods         POST
*/

booky.post("/book/new",async(req,res)=>{
    const {newBook} = req.body;
    const addNewBook = BookModel.create(newBook);
    return res.json({
        books: addNewBook,
        message : "Book was added"
    });
});

/*
Route           /author/new
Description     Add new authors
Access          PUBLIC
Parameter       NONE
Methods         POST
*/

booky.post("/author/new",(req,res)=>{
    const { newAuthor } = req.body;
    const addNewAuthor = AuthorModel.create(newAuthor);
    return res.json({
        books: addNewAuthor,
        message : "Author was added"
    });
    
})

booky.post("/publications/new",(req,res)=>{
    const newPublication = req.body;
    database.publication.push(newPublication);
    return res.json(database.publication)
});

/******** PUT *********/ 
/*
Route           /book/update
Description     Update book on isbn
Access          PUBLIC
Parameter       isbn
Methods         PUT
*/
booky.put("/book/update/:isbn",async(req,res)=>{
    const updatedBook = await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            title: req.body.bookTitle
        },
        {
            new: true 
        }
    );
    return res.json({
        books: updatedBook
    });
});

/* Updating new author*/
/*
Route           /book/author/update
Description     Update/add new author
Access          PUBLIC
Parameter       isbn
Methods         PUT
*/

booky.put("book/author/update/:isbn",async(req,res)=>{
    //update book database
    const updatedBook = await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            $addToSet: {
                authors: req.body.newAuthor
            }
        },
        {
            new:true
        });

    //update the author database
    const updatedAuthor = await AuthorModel.findOneAndUpdate(
        {
            id: req.body.newAuthor
        },
        {
            $addToSet:{
                books: req.params.isbn
            }
        },
        {
            new: true
        });
        return res.json({
            books:updatedBook,
            authors: updatedAuthor,
            message : "New author was added"
        });
});




/*
Route           /publications/update/book
Description     Update / Add new publications
Access          PUBLIC
Parameter       isbn
Methods         PUT
*/

booky.put("/publications/update/book/:isbn",(req,res)=>{
    //Update the publication database
    database.publication.forEach((pub)=>{
        if(pub.id === req.body.pubId) {
            return pub.books.push(req.params.isbn);
        }
    });
    //Update the books database
    database.books.forEach((book)=>{
        if(book.ISBN=== req.params.isbn){
            book.publications = req.body .pubId;
            return;
        }
    });
    return res.json({
        books : database.books,
        publications: database.publication,
        message:"Successfully updated publication"
    })
});

//DELETE
/*
Route           /book/delete
Description     Delete a book
Access          PUBLIC
Parameter       isbn
Methods         DELETE
*/

booky.delete("/book/delete/:isbn", (req,res)=>{
    //which ever book that doesnot match with the isbn just send it to an updatedBookDatabase
    //and rest will be filtered out
    const updatedBookDatabase = database.books.filter(
        (book)=> book.ISBN !== req.params.isbn
    );
    database.books = updatedBookDatabase;

    return res.json({books:database.books});
})
/*
Route           /book/delete/author
Description     Delete an author from a book and vice versa
Access          PUBLIC
Parameter       isbn, authorId
Methods         DELETE
*/
booky.delete("/book/delete/author/:isbn/:authorId", (req,res)=>{
    //Update the book data base
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            const newAuthoList = book.author.filter(
                (eachAuthor)=> eachAuthor !== parseInt(req.params.authorId)
            );
            book.author = newAuthoList;
            return;
        }
    });

    //Update the author database
    database.author.forEach((eachAuthor)=>{
        if(eachAuthor.id === parseInt(req.params.authorId)){
            const newBookList = eachAuthor.books.filter(
                (book)=>book !== req.params.isbn
            );
            eachAuthor.books = newBookList;
            return;
        }
    });
    return res.json({
        book: database.books,
    author:database.author,
    message: "Author was deleted"
    });

})

booky.listen(3000,() => {
    console.log("Server is up and running");
});