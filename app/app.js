var helloWorld = new Ext.Application({

    Photo: Ext.regModel('Photo', {
        fields:[
            {name:'id'},
            {name:'farm'},
            {name:'owner'},
            {name:'secret'},
            {name:'server'},
            {name:'title'},
            {name:'url'},
        ],
        setUrl: function() {
            var url = "http://farm" + this.get('farm') +
                ".static.flickr.com/" + this.get('server') +
                "/" + this.get('id') + "_" + this.get('secret') + "_s.jpg";

            var script = document.createElement("script");
            script.setAttribute("src",
                "http://i.tinySrc.mobi/data.helloWorld.setPhotoUrl-" + this.getId() +
                "/" + url
            );
            script.setAttribute("type","text/javascript");
            document.body.appendChild(script);
        }
    }),

    setPhotoUrl: function (id, dataUrl) {
        var photo = this.offlineStore.getById(id);
        photo.set('url', dataUrl);
        this.offlineStore.sync();
    },

    onlineStore: new Ext.data.Store({
        model: 'Photo',
        proxy: {
            type: 'scripttag',
            url: 'http://query.yahooapis.com/v1/public/yql?format=json&q=' +
                escape(
                    'select * from flickr.photos.search where text="hello" limit 10'
                ),
            reader: new Ext.data.JsonReader({
                root: 'query.results.photo'
            }),
            timeout: 2000,
            listeners: {
                exception:function () {
                    console.log("I think we are offline");
                    helloWorld.gallery.bindStore(helloWorld.offlineStore);
                    helloWorld.offlineStore.load();
                }
            }
        }
    }),

    offlineStore: new Ext.data.Store({
        model: 'Photo',
        proxy: {
            type: 'localstorage',
            id: 'helloworld'
        }
    }),

    launch: function() {
        this.tabs = new Ext.TabPanel({
            fullscreen: true,
            dockedItems: [{xtype:'toolbar', title:'Hello World'}],
            tabBar: {
                ui: 'light',
                layout: {
                    pack: 'center'
                }
            },
            items: [
                {cls:'hello', title:'Hello'},
                {cls:'world', title:'World'},
                {
                    cls: 'gallery',
                    title: 'Gallery',
                    xtype: 'list',
                    store: null,
                    itemTpl:'<img src="{url}" />{title}'
                },
                {
                    cls: 'status',
                    title: '?',
                    html: navigator.onLine ? 'online' : 'offline'
                },
            ]
        });
        this.gallery = this.tabs.items.getAt(2);

        this.onlineStore.addListener('load', function () {
            console.log("I think we are online");
            helloWorld.offlineStore.proxy.clear();
            this.each(function (record) {
                var photo = helloWorld.offlineStore.add(record.data)[0];
                photo.setUrl();
            });
            helloWorld.offlineStore.sync();
            helloWorld.gallery.bindStore(helloWorld.offlineStore);
        });
        this.onlineStore.load();
    }

});
