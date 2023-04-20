const express = require("express");
var bodyParser= require("body-parser"); //need for hos request

//Datebase
const database= require("./database");
const { author } = require("./database");

//initialize express
const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());
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

booky.get("/publications",(req,res)=>{
    return res.json({publications: database.publication});
    })

    //POST

/*
Route           /book/new
Description     Add new book
Access          PUBLIC
Parameter       NONE
Methods         POST
*/

booky.post("/book/new",(req,res)=>{
    const newBook = req.body;
    database.books.push(newBook);
    return res.json({updatedBooks: database.books});
});

/*
Route           /author/new
Description     Add new authors
Access          PUBLIC
Parameter       NONE
Methods         POST
*/

booky.post("/author/new",(req,res)=>{
    const newAuthor = req.body;
    database.author.push(newAuthor);
    return res.json(database.author)
})

booky.post("/publications/new",(req,res)=>{
    const newPublication = req.body;
    database.publication.push(newPublication);
    return res.json(database.publication)
})

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