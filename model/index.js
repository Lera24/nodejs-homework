const fs = require('fs').promises;
const path = require('path');
const shortid = require('shortid');
const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async() => {
    const data = await fs.readFile(contactsPath);
    const allContacts = JSON.parse(data);
    return allContacts;
  }
  
 const getContactById = async(contactId) => {
    const contacts = await listContacts();
    const result = contacts.find(item => item.id === contactId);

    if(!result) {
      return null;
    }

    return result;
}
  
const addContact = async(data) => {
    const newContact = {id: shortid.generate(), ...data};
    const contacts = await listContacts();
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  }

  const removeContact = async(contactId) => {
    const contacts = await listContacts();
    const idx = contacts.findIndex(item => item.id === contactId);

    if(idx === -1) {
      return null;
    };

    const removeContact = contacts.splice(idx, 1);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return removeContact;
    }

    const updateContact = async({id, name, email, phone}) => {
      const contacts = await listContacts();
      const idx = contacts.findIndex(item => item.id === id);

      if(idx === -1){
        return null;
       };

      contacts[idx] = {id, name, email, phone};
      await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
      return contacts[idx];
    }

  module.exports = {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact
  }