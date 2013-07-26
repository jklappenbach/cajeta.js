define(
    ['cajeta'],
    function(Cajeta) {
        // First test classes and extend functionality
        return describe('Cajeta Objects', function() {
            var Parent = Cajeta.Class.extend({
                initialize: function(properties) {
                    properties = properties || {};
                    this.cannonical = 'Parent';
                    this.name = properties.name;
                },
                one: 'one',
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
                    this.cannonical += ':GrandChild';
                },
                getCannonical: function(properties) {
                    properties = properties || {};
                    var self = properties.self || this;
                    properties.self = self.super;
                    return self.super.getCannonical.call(this, properties);
                }
            });

            var parent = new Parent({ name: 'Tara' });
            var child = new Child({ name: 'Jason' });
            var grandChild = new GrandChild({ name: 'Aron' });

            it('implement polymorphism', function() {
                var cannonical = parent.getCannonical();
                var name = parent.getName();
                expect(parent.getCannonical()).toEqual('Parent');
                expect(child.getCannonical()).toEqual('Parent:Child');
                expect(grandChild.getCannonical()).toEqual('Parent:Child:GrandChild');
            });

            it('support inheritance', function() {
                expect(child instanceof Parent).toBeTruthy();
                expect(grandChild instanceof Parent).toBeTruthy();
                expect(parent.getName()).toEqual('Tara');
                expect(grandChild.getName()).toEqual('Aron');
                expect(grandChild.one).toEqual('one');
            });
        });
    }
);
