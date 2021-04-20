'use strict';

require('dotenv').config();

const PORT =process.env.PORT;

const express=require('express');
const pg     =require('pg');
const superagent=require('superagent');
const methodoverrid=require('method-override')

const client =new pg.Client(process.env.DB_URL)
client.on('error',err=>{console.log(err);})

const app=express();

app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodoverrid('_method'));
app.use(express.static('./public'));


app.get('/',renderhompage)
app.get('/allchar',renderapi)
app.post('/allchar',savetodatabase)
app.get('/mychar',rendermychar)
app.get('/details/:id',renderonechar)
app.put('/details/:id',editonechar)
app.delete('/details/:id', deleteonechar)


function renderhompage(req,res){
    res.render('index');
}

function renderapi(req,res){
    const url=`http://hp-api.herokuapp.com/api/characters`
    superagent.get(url).then(result=>{
        res.render('allchar',{data:result.body})
    })
}

function savetodatabase(req,res){
let name=req.body.name;
let img=req.body.img;
let color=req.body.color;

let sql='INSERT INTO CHARACTERS (name,img,hairColour)values($1,$2,$3)'

client.query(sql,[name,img,color]).then(result=>{
    console.log(result.rows);
res.redirect('allchar');
})
}
function rendermychar(req,res){
    let sql='select * from CHARACTERS';

    client.query(sql).then(result=>{
        res.render('mychar',{data:result.rows})
    })
}

function renderonechar(req,res){
    let id =req.params.id;
  const  sql=`select * from CHARACTERS where id=$1`

  client.query(sql,[id]).then(result=>{
      console.log(result.rows[0]);
      res.render('details',{data:result.rows[0]})
  })
}

function editonechar(req,res){
    let id=req.body.id;
    let name=req.body.name;
    let img=req.body.img;
    let color=req.body.color; 
let sql='UPDATE CHARACTERS SET name =$1, img=$2,hairColour=$3  WHERE id=$4';
 client.query(sql,[name,img,color,id]).then(()=>{
     res.redirect(`/details/${id}`);
    //  res.redirect(`/details/${id}`);
 })

}
function deleteonechar(req,res){
    let id =req.body.id;
  let  sql='delete from CHARACTERS where id=$1';

  client.query(sql,[id]).then(()=>{
      res.redirect('/mychar');
  })
}

app.get('*',render404)
function render404(req,res){
    res.status(404).send('page not found');
}
client.connect(()=>{
    console.log('connect database success');
    app.listen(PORT,()=>{console.log(`connect on ${PORT}`)});
})
