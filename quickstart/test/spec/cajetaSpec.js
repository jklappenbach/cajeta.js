define(
    ['cajeta'],
    function(Cajeta) {
        // First test classes and extend functionality
        return describe('Cajeta Class Tests...', function() {
            var Parent = Cajeta.Class.extend({
                initialize: function(properties) {
                    properties = properties || {};
                    this.cannonical = 'Parent';
                    this.name = properties.name;
                },
                one: 'one',
                two: 'two',
                getCannonical: function(properties) {
                    return this.cannonical;
                },
                getName: function() {
                    return this.name;
                }
            });

            var Child = Parent.extend({
                initialize: function(properties) {
                    properties = properties || {};
                    var self = properties.self || this;
                    properties.self = self.super;
                    self.super.initialize.call(this, properties);
                    this.five = 'five';
                    this.six = 'six';
                    this.cannonical += ':Child';
                },
                three: 'three',
                four: 'four',
                getCannonical: function(properties) {
                    properties = properties || {};
                    var self = properties.self || this;
                    properties.self = self.super;
                    return self.super.getCannonical.call(this, properties);
                }
            });

            var GrandChild = Child.extend({
                initialize: function(properties) {
                    properties = properties || {};
                    var self = properties.self || this;
                    properties.self = self.super;
                    self.super.initialize.call(this, properties);
                    this.seven = 'seven';
                    this.eight = 'eight';
                    this.cannonical += ':GrandChild';
                },
                getCannonical: function(properties) {
                    properties = properties || {};
                    var self = properties.self || this;
                    properties.self = self.super;
                    return self.super.getCannonical.call(this, properties);
                }
            });

            it('works for app', function() {
                var parent = new Parent();
                var child = new Child();
                var grandChild = new GrandChild();
                var cannonical = parent.getCannonical();
                var name = parent.getName();
                expect(parent.getCannonical()).toEqual('Parent');
                expect(child.getCannonical()).toEqual('Parent:Child');
                expect(grandChild.getCannonical()).toEqual('Parent:Child:GrandChild');
                expect(child instanceof Parent).toEqual(true);
                expect(grandChild instanceof Parent).toEqual(true);
            });
        });
    }
);
