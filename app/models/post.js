var Post = function () {
  this.defineProperties({
    title: {type: 'string'}
  , slug: {type: 'string'}
  , draft: {type: 'boolean'}
  , html: {type: 'string'}
  , content: {type: 'string'}
  , id: {type: 'string'}
  , date: {type: 'date'}
  });
  this.hasMany('Comments');
  this.adapter = 'Mongo';
};
Post = geddy.model.register('Post', Post);
