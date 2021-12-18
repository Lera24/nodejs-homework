const express = require('express');
const router = express.Router()
const contactsOperations = require('../../model/index');
const {	NotFound, BadRequest } = require("http-errors");
const Joi = require("joi");

const joiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required()
})

router.get('/', async (req, res, next) => {
 try{
  const contacts = await contactsOperations.listContacts();
  res.json(contacts);
 } catch(error){
   next(error);
 }
})

router.get('/:id', async (req, res, next) => {
  const {id} = req.params;
  try{
    const contact = await contactsOperations.getContactById(id);
    if(!contact){
      throw new NotFound();
    }
    res.json(contact);
  } catch(error){
    next(error);
  }
})

router.post('/', async (req, res, next) => {
  try{
    const {error} = joiSchema.validate(req.body);
    if(error) {
      throw new BadRequest("missing required name field");
    }
    const newContacts = await contactsOperations.addContact(req.body);
    res.status(201).json(newContacts);
  } catch(error) {
    next(error);
  }
})

router.delete('/:id', async (req, res, next) => {
 try{
   const {id} = req.params;
  const deleteProduct = await contactsOperations.removeContact(id);
  if(!deleteProduct){
    throw new NotFound()
  };
  res.json({message: 'contact deleted'});
 } catch(error) {
  next(error);
 }
})

router.put('/:id', async (req, res, next) => {
try{
  const {error} = joiSchema.validate(req.body);
  if(error) {
    throw new BadRequest("missing fields");
  }
  const {id} = req.params;
  const updateContacts = await contactsOperations.updateContact({id, ...req.body});
  if(!updateContacts){
    throw new NotFound()
  };
  res.json(updateContacts);
} catch (error) {
  next(error)
}
})


module.exports = router
