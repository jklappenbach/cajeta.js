define([
    'cajeta',
    'text!app/view/home/homePage.html'
], function(Cajeta, template) {
        // First test classes and extend functionality
        return describe('Cajeta.View.Component', function() {
            if (Cajeta.theApplication == null)
                Cajeta.theApplication = new Cajeta.Application({
                    id: 'componentTestApp'
                });

            var modelCache = Cajeta.theApplication.model;

            var component = new Cajeta.View.Component({
                id: 'test',
                modelPath: 'testForm.data',
                modelValue: 'forests'
            });

            var component2 = new Cajeta.View.Component({
                id: 'test2',
                modelPath: 'testForm.data2',
                modelValue: 'super'
            });

            it('throws an exception on instantiation without a componentId', function() {
                expect(function() { new Cajeta.View.Component(); }).toThrow(Cajeta.ERROR_COMPONENT_COMPONENTID_UNDEFINED);
            });

            it('accepts attribute changes before attaching a template, or docking', function() {
                component.attr('one', 'one');
                expect(component.attr('one')).toEqual('one');
                component.prop('two', 'two');
                expect(component.prop('two')).toEqual('two');
            });

            it('can be bound to the model', function() {
                var modelAdaptor = component.modelAdaptor;
                modelCache.addListener(modelAdaptor, Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                        modelAdaptor.getEventOperand());
                expect(function() { component.modelAdaptor.onComponentChanged() }).not.toThrow();
                modelCache.addListener(component2, Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                        component.modelAdaptor.getEventOperand());
                expect(function() { component2.setModelValue('delicious') }).not.toThrow();
            });

            it('accepts an html template', function() {
                component.setTemplate('homePage', template);
                expect(component.template).toBeDefined();
            });

            it('can set the model value', function() {
                component.setModelValue('three');
                //alert(Cajeta.theApplication.id);
                expect(modelCache.get(component.modelAdaptor.modelPath,
                        component.modelAdaptor.datasourceId)).toEqual('three');
                expect(component.getModelValue()).toEqual('three');
            });

            it('should encode the model value in the component html/template/member', function() {
                expect(component.attr('value')).toEqual('three');
            });

            it('can get a model value', function() {
                expect(component.getModelValue()).toEqual('three');
            });

        });
    }
);
