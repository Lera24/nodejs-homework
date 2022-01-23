const express = require('express');
const router = express.Router();

const {	NotFound, BadRequest } = require("http-errors");
const { authenticate } = require('../../middlewares');
const { Contact } = require("../../models");

router.get('/', authenticate, async (req, res, next) => {
 try{
  const {page = 1, limit = 20} = req.query;
  const {_id} = req.user;
  const skip = (page - 1) * limit;
  const contacts = await Contact.find({owner: _id}, '-createdAt -updateAt', {skip, limit: +limit});
  res.json(contacts);
 } catch(error){
   next(error);
 }
})

router.get('/:id', async (req, res, next) => {
  const {id} = req.params;
  try{
    const contact = await Contact.findById(id);

    if(!contact){
      throw new NotFound();
    }
    res.json(contact);
  } catch(error){
    if(error.message.includes("Cast to ObjectId failed")){
      error.statis = 404;
       }
    next(error);
  }
})

router.post('/', authenticate, async (req, res, next) => {
  try{
    const {_id} = req.user;
    const newContacts = await Contact.create({...req.body, owner: _id});
    res.status(201).json(newContacts);
  } catch(error) {
    if(error.message.includes("validation failed")){
      error.statis = 400;
       }
    next(error);
  }
})
  
router.put('/:id', async (req, res, next) => {
try{
  const {id} = req.params;
  const updateContacts = await Contact.findByIdAndUpdate(id, req.body, {new: true});
  if(!updateContacts){
    throw new NotFound()
  };
  res.json(updateContacts);
} catch (error) {
  if(error.message.includes("validation failed")){
    error.statis = 400;
     }
  next(error)
}
}) 

router.patch("/:id/favorite", async(req, res, next)=> {
  try{
    const {id} = req.params;
    const {favorite} = req.body;
    const updateContacts = await Contact.findByIdAndUpdate(id, {favorite}, {new: true});
    if(!updateContacts){
      throw new BadRequest()
    };
    res.json(updateContacts);
  } catch (error) {
    if(error.message.includes("validation failed")){
      error.statis = 404;
       }
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try{
    const {id} = req.params;
   const deleteContact = await Contact.findByIdAndRemove(id);
   if(!deleteContact){
     throw new NotFound()
   };
   res.json({message: 'contact deleted'});
  } catch(error) {
   next(error);
  }
 })


module.exports = router
