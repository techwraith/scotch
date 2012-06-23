var Settings = function () {
  this.defineProperties({
    title: {type: 'string', required: true}
  , description: {type: 'string'}
  , authorEmail: {type: 'string'}
  , authorPassword: {type: 'string'}
  , authorName: {type: 'string'}
  , enableComments: {type: 'boolean', default: true}
  , approveComments: {type: 'boolean', default: false}
  });
  this.adapter = 'Mongo';
};
Settings = geddy.model.register('Settings', Settings);
