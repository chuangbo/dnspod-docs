Lists = new Meteor.Collection('lists');
Docs = new Meteor.Collection('docs');


Session.set('list_name', null)
Session.set('doc_view_title', null)
Session.set('tag_filter', null)


Template.main.editing_one_doc = ->
  Session.equals('view', 'doc_edit')


Template.lists.lists = ->
  Lists.find()

okcancel_events = (selector) ->
  "keyup #{selector}, keydown #{selector}, focusout #{selector}"

make_okcancel_handler = (options) ->
  ok = options.ok ? ->
  cancel = options.cancel ? ->

  (evt) ->
    if evt.type == "keydown" and evt.which == 27
      # escape = cancel
      cancel.call(this, evt)

    else if evt.type == "keyup" and evt.which == 13 or
               evt.type == "focusout"
      # blur/return/enter = ok/submit if non-empty
      value = String(evt.target.value ? "");
      if value
        ok.call(this, value, evt)
      else
        cancel.call(this, evt)


focus_field_by_id = (id) ->
  input = $("#"+id);
  if input
    input.focus()
    input.select()


Template.lists.events = {}
Template.lists.events[ okcancel_events('.add-list') ] = make_okcancel_handler
  ok: (text, evt) ->
    if not Lists.findOne(name: text)
      id = Lists.insert(name: text)
      evt.target.value = ''


Template.list_item.active = ->
  'active' if Session.equals("list_name", this.name)


Template.content.is_index = ->
  Session.equals('view', 'index')
Template.content.list_docs = ->
  Session.equals('view', 'docs')
Template.content.opened_one_doc = ->
  Session.equals('view', 'doc')



Template.tag_filter.tags = ->
  tag_infos = []
  total_count = 0
  list_name = Session.get('list_name')
  list = Lists.findOne(name: list_name)
  if list
    Docs.find({list_id: list._id}).forEach( (doc) ->
      _.each(doc.tags, (tag) ->
        tag_info = _.find(tag_infos, (x) -> x.tag == tag )
        if !tag_info
          tag_infos.push({tag: tag, count: 1})
        else
          tag_info.count++
      )
      total_count++
    )

    tag_infos = _.sortBy(tag_infos, (x) -> x.tag )
    tag_infos.unshift({tag: null, count: total_count})
    tag_infos

Template.tag_item.tag_text = ->
  this.tag ? "All items"


Template.tag_item.selected = ->
  if Session.equals('tag_filter', this.tag) then 'selected' else ''

Template.tag_item.events =
  "click": ->
    Session.set('tag_filter', this.tag)

Template.docs.docs = () ->
  list_name = Session.get('list_name')
  list = Lists.findOne(name: list_name)
  console.log 'get list docs', list_name
  if list
    sel = {list_id: list._id}
    tag_filter = Session.get('tag_filter')
    if tag_filter
      sel.tags = tag_filter
    Docs.find(sel, {sort: {timestamp: -1}})

Template.docs.events =
  "click .new-doc-ok, keyup #newDocName": (evt) ->
    if evt.type == "keyup" and evt.which == 13 or
        evt.type == 'click'
      title = $('#newDocName').val()
      unless title == '' and Docs.findOne(title: title)
        list_name = Session.get('list_name')
        list_id = Lists.findOne(name: list_name)._id
        demo = Docs.findOne(title: "MarkdownDemo")
        demo_content = demo.content if demo else ''
        $('#newdoc').modal('hide')
        Docs.insert(title: title, list_id: list_id, content: "##{title} \n\n#{demo_content}", tags:[], timestamp: new Date())
        Router.setList("#{list_name}/#{title}/edit")

Template.doc_item.last_modify = ->
  moment.utc(this.timestamp).fromNow()

Template.doc_item.tag_objs = ->
  doc_id = this._id
  _.map(this.tags ? [], (tag) -> 
    doc_id: doc_id
    tag: tag
  )

Template.doc_item.events = 
  "click .new-tag": ->
    Session.set('editing_addtag', this._id);
    Meteor.flush()
    focus_field_by_id("edittag-input")

Template.doc_item.events[ okcancel_events('#edittag-input') ] =
  make_okcancel_handler(
    ok: (value) ->
      Docs.update(this._id, {$addToSet: {tags: value}})
      Session.set('editing_addtag', null)
    cancel: ->
      Session.set('editing_addtag', null)
  )

Template.doc_item.adding_tag = ->
  Session.equals('editing_addtag', this._id)

Template.tag.events =
  'click .tag_name': ->
    Session.set('tag_filter', this.tag)
  'click .remove-tag': ->
    Docs.update({_id: this.doc_id}, {$pull: {tags: this.tag}})

get_doc_path = ->
  list_name = Session.get('list_name')
  "#{list_name}/#{@title}"

Template.doc_item.path = get_doc_path

Template.view_doc.doc = ->
  doc_title = Session.get('doc_view_title')
  console.log 'doc_title', doc_title
  console.log 'doc', Docs.findOne(title: doc_title)
  Docs.findOne(title: doc_title) ? {}

Template.view_doc.path = get_doc_path

Template.view_doc.events =
  "click .delete-doc": ->
    doc_title = Session.get('doc_view_title')
    Docs.remove(title: doc_title)
    $('#removeDoc').modal('hide')
    list_name = Session.get('list_name')
    Router.setList("#{list_name}")


Template.edit_doc.doc = ->
  doc_title = Session.get('doc_view_title')
  console.log 'doc_title', doc_title
  console.log 'edit_doc', Docs.findOne(title: doc_title)
  Docs.findOne(title: doc_title) ? {}

Template.edit_doc.path = get_doc_path

Template.edit_doc.events =
  'click .save': ->
    doc_title = Session.get('doc_view_title')
    content = $('textarea').val()
    Docs.update({title: doc_title}, {$set: {content: content, timestamp: new Date()}})
  'keyup textarea': ->
    content = $('textarea').val()
    $('.doc_preview').html(Template.edit_doc_preview(content: content))
    $('textarea').height($('.doc_preview').height())


TodosRouter = Backbone.Router.extend
  routes:
    "": "index"
    ":list_name": "list_view"
    ":list_name/:doc_title": "doc_view"
    ":list_name/:doc_title/edit": "doc_edit_view"
  index: ->
    Session.set('view', 'index')
    Session.set("doc_view_title", null)
    Session.set("list_name", null)
    Session.set("tag_filter", null);
  list_view: (list_name) ->
    console.log 'router: list view', list_name
    Session.set('view', 'docs')
    Session.set("doc_view_title", null)
    Session.set("list_name", list_name)
    Session.set("tag_filter", null);
  doc_view: (list_name, doc_title) ->
    console.log 'router: doc view', list_name
    Session.set('view', 'doc')
    Session.set('list_name', list_name)
    Session.set('doc_view_title', doc_title)
    Session.set("tag_filter", null);
  doc_edit_view: (list_name, doc_title) ->
    console.log 'router: doc edit view', list_name
    Session.set('view', 'doc_edit')
    Session.set('list_name', list_name)
    Session.set('doc_view_title', doc_title)
    Session.set("tag_filter", null);
    
  
  setList: (list_name) ->
    this.navigate(list_name, true)


Router = new TodosRouter

Meteor.startup ->
  Backbone.history.start()

# export some var to window for debug
exports = exports ? this;
_(exports).extend
  Router: Router
  Lists: Lists
  Docs: Docs