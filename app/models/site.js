var Site = function () {

  this.defineProperties({
    title: {type: 'string'},
    firstName: {type: 'string'},
    lastName: {type: 'string'},
    email: {type: 'string'},
    password: {type: 'string'},
  });

  this.hasMany('Posts')

};

User = geddy.model.register('Site', Site);

