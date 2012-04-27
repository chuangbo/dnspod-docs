(function() {
  var Docs, Lists, Router, TodosRouter, exports, focus_field_by_id, get_doc_path, make_okcancel_handler, okcancel_events;
  Lists = new Meteor.Collection('lists');
  Docs = new Meteor.Collection('docs');
  Session.set('list_name', null);
  Session.set('doc_view_title', null);
  Session.set('tag_filter', null);
  Template.main.editing_one_doc = function() {
    return Session.equals('view', 'doc_edit');
  };
  Template.lists.lists = function() {
    return Lists.find();
  };
  okcancel_events = function(selector) {
    return "keyup " + selector + ", keydown " + selector + ", focusout " + selector;
  };
  make_okcancel_handler = function(options) {
    var cancel, ok, _ref, _ref2;
    ok = (_ref = options.ok) != null ? _ref : function() {};
    cancel = (_ref2 = options.cancel) != null ? _ref2 : function() {};
    return function(evt) {
      var value, _ref3;
      if (evt.type === "keydown" && evt.which === 27) {
        return cancel.call(this, evt);
      } else if (evt.type === "keyup" && evt.which === 13 || evt.type === "focusout") {
        value = String((_ref3 = evt.target.value) != null ? _ref3 : "");
        if (value) {
          return ok.call(this, value, evt);
        } else {
          return cancel.call(this, evt);
        }
      }
    };
  };
  focus_field_by_id = function(id) {
    var input;
    input = $("#" + id);
    if (input) {
      input.focus();
      return input.select();
    }
  };
  Template.lists.events = {};
  Template.lists.events[okcancel_events('.add-list')] = make_okcancel_handler({
    ok: function(text, evt) {
      var id;
      if (!Lists.findOne({
        name: text
      })) {
        id = Lists.insert({
          name: text
        });
        return evt.target.value = '';
      }
    }
  });
  Template.list_item.active = function() {
    if (Session.equals("list_name", this.name)) {
      return 'active';
    }
  };
  Template.content.is_index = function() {
    return Session.equals('view', 'index');
  };
  Template.content.list_docs = function() {
    return Session.equals('view', 'docs');
  };
  Template.content.opened_one_doc = function() {
    return Session.equals('view', 'doc');
  };
  Template.tag_filter.tags = function() {
    var list, list_name, tag_infos, total_count;
    tag_infos = [];
    total_count = 0;
    list_name = Session.get('list_name');
    list = Lists.findOne({
      name: list_name
    });
    if (list) {
      Docs.find({
        list_id: list._id
      }).forEach(function(doc) {
        _.each(doc.tags, function(tag) {
          var tag_info;
          tag_info = _.find(tag_infos, function(x) {
            return x.tag === tag;
          });
          if (!tag_info) {
            return tag_infos.push({
              tag: tag,
              count: 1
            });
          } else {
            return tag_info.count++;
          }
        });
        return total_count++;
      });
      tag_infos = _.sortBy(tag_infos, function(x) {
        return x.tag;
      });
      tag_infos.unshift({
        tag: null,
        count: total_count
      });
      return tag_infos;
    }
  };
  Template.tag_item.tag_text = function() {
    var _ref;
    return (_ref = this.tag) != null ? _ref : "All items";
  };
  Template.tag_item.selected = function() {
    if (Session.equals('tag_filter', this.tag)) {
      return 'selected';
    } else {
      return '';
    }
  };
  Template.tag_item.events = {
    "click": function() {
      return Session.set('tag_filter', this.tag);
    }
  };
  Template.docs.docs = function() {
    var list, list_name, sel, tag_filter;
    list_name = Session.get('list_name');
    list = Lists.findOne({
      name: list_name
    });
    console.log('get list docs', list_name);
    if (list) {
      sel = {
        list_id: list._id
      };
      tag_filter = Session.get('tag_filter');
      if (tag_filter) {
        sel.tags = tag_filter;
      }
      return Docs.find(sel, {
        sort: {
          timestamp: -1
        }
      });
    }
  };
  Template.docs.events = {
    "click .new-doc-ok, keyup #newDocName": function(evt) {
      var demo_content, list_id, list_name, title;
      if (evt.type === "keyup" && evt.which === 13 || evt.type === 'click') {
        title = $('#newDocName').val();
        if (!(title === '' && Docs.findOne({
          title: title
        }))) {
          list_name = Session.get('list_name');
          list_id = Lists.findOne({
            name: list_name
          })._id;
          demo_content = Docs.findOne({
            title: "MarkdownDemo"
          }).content;
          $('#newdoc').modal('hide');
          Docs.insert({
            title: title,
            list_id: list_id,
            content: "#" + title + " \n\n" + demo_content,
            tags: [],
            timestamp: new Date()
          });
          return Router.setList("" + list_name + "/" + title + "/edit");
        }
      }
    }
  };
  Template.doc_item.last_modify = function() {
    return moment.utc(this.timestamp).fromNow();
  };
  Template.doc_item.tag_objs = function() {
    var doc_id, _ref;
    doc_id = this._id;
    return _.map((_ref = this.tags) != null ? _ref : [], function(tag) {
      return {
        doc_id: doc_id,
        tag: tag
      };
    });
  };
  Template.doc_item.events = {
    "click .new-tag": function() {
      Session.set('editing_addtag', this._id);
      Meteor.flush();
      return focus_field_by_id("edittag-input");
    }
  };
  Template.doc_item.events[okcancel_events('#edittag-input')] = make_okcancel_handler({
    ok: function(value) {
      Docs.update(this._id, {
        $addToSet: {
          tags: value
        }
      });
      return Session.set('editing_addtag', null);
    },
    cancel: function() {
      return Session.set('editing_addtag', null);
    }
  });
  Template.doc_item.adding_tag = function() {
    return Session.equals('editing_addtag', this._id);
  };
  Template.tag.events = {
    'click': function() {
      return Session.set('tag_filter', this);
    }
  };
  get_doc_path = function() {
    var list_name;
    list_name = Session.get('list_name');
    return "" + list_name + "/" + this.title;
  };
  Template.doc_item.path = get_doc_path;
  Template.view_doc.doc = function() {
    var doc_title, _ref;
    doc_title = Session.get('doc_view_title');
    console.log('doc_title', doc_title);
    console.log('doc', Docs.findOne({
      title: doc_title
    }));
    return (_ref = Docs.findOne({
      title: doc_title
    })) != null ? _ref : {};
  };
  Template.view_doc.path = get_doc_path;
  Template.view_doc.events = {
    "click .delete-doc": function() {
      var doc_title, list_name;
      doc_title = Session.get('doc_view_title');
      Docs.remove({
        title: doc_title
      });
      $('#removeDoc').modal('hide');
      list_name = Session.get('list_name');
      return Router.setList("" + list_name);
    }
  };
  Template.edit_doc.doc = function() {
    var doc_title, _ref;
    doc_title = Session.get('doc_view_title');
    console.log('doc_title', doc_title);
    console.log('edit_doc', Docs.findOne({
      title: doc_title
    }));
    return (_ref = Docs.findOne({
      title: doc_title
    })) != null ? _ref : {};
  };
  Template.edit_doc.path = get_doc_path;
  Template.edit_doc.events = {
    'click .save': function() {
      var content, doc_title;
      doc_title = Session.get('doc_view_title');
      content = $('textarea').val();
      return Docs.update({
        title: doc_title
      }, {
        $set: {
          content: content,
          timestamp: new Date()
        }
      });
    },
    'keyup textarea': function() {
      var content;
      content = $('textarea').val();
      $('.doc_preview').html(Template.edit_doc_preview({
        content: content
      }));
      return $('textarea').height($('.doc_preview').height());
    }
  };
  TodosRouter = Backbone.Router.extend({
    routes: {
      "": "index",
      ":list_name": "list_view",
      ":list_name/:doc_title": "doc_view",
      ":list_name/:doc_title/edit": "doc_edit_view"
    },
    index: function() {
      Session.set('view', 'index');
      Session.set("doc_view_title", null);
      Session.set("list_name", null);
      return Session.set("tag_filter", null);
    },
    list_view: function(list_name) {
      console.log('router: list view', list_name);
      Session.set('view', 'docs');
      Session.set("doc_view_title", null);
      Session.set("list_name", list_name);
      return Session.set("tag_filter", null);
    },
    doc_view: function(list_name, doc_title) {
      console.log('router: doc view', list_name);
      Session.set('view', 'doc');
      Session.set('list_name', list_name);
      Session.set('doc_view_title', doc_title);
      return Session.set("tag_filter", null);
    },
    doc_edit_view: function(list_name, doc_title) {
      console.log('router: doc edit view', list_name);
      Session.set('view', 'doc_edit');
      Session.set('list_name', list_name);
      Session.set('doc_view_title', doc_title);
      return Session.set("tag_filter", null);
    },
    setList: function(list_name) {
      return this.navigate(list_name, true);
    }
  });
  Router = new TodosRouter;
  Meteor.startup(function() {
    return Backbone.history.start();
  });
  exports = exports != null ? exports : this;
  _(exports).extend({
    Router: Router,
    Lists: Lists,
    Docs: Docs
  });
}).call(this);
