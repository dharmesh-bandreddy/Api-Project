const express = require("express");

//Datebase
const database= require("./database");

//initialize express
const booky = express();
/*
Route           /
Description     Get all the books
Access          PUBLIC
Parameter       NONE
Methods         GET
*/

booky.get("/",(req,res)=>{
    return res.json({books: database.books})
});

/*
Route           /is
Description     Get specific book on isbn 
Access          PUBLIC
Parameter       isbn
Methods         GET
*/

booky.get("/is/:isbn",(req,res)=>{
    const getSpecificBook = database.books.filter(
        (book) => book.ISBN === req.params.isbn
    );

    if(getSpecificBook.length===0){
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

booky.get("/c/:category",(req,res)=>{
    const getSpecificBook = database.books.filter(
        (book) => book.category.includes(req.params.category)
    )
    if(getSpecificBook.length===0){
        return res.json({error:`No book found for the category ${req.params.category}`})
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

booky.get("/author",(req,res)=>{
    return res.json({authors:database.author})
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

booky.get("/publications",(req,res)=>{
    return res.json({publications: database.publication});
})


booky.listen(3000,() => {
    console.log("Server is up and running");
});