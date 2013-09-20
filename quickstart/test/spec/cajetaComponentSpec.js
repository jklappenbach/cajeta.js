define([
    'cajeta',
    'text!app/view/home/homePage.html',
    'model'
], function(Cajeta, template, model) {
        // First test classes and extend functionality
        return describe('Cajeta.View.Component', function() {
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
                model.addListener(component, Cajeta.Events.EVENT_MODELCACHE_CHANGED);
                expect(function() { component.onComponentChanged() }).not.toThrow();
                model.addListener(component2, Cajeta.Events.EVENT_MODELCACHE_CHANGED);
                expect(function() { component2.setComponentValue('delicious') }).not.toThrow();
            });

            it('accepts an html template', function() {
                component.setTemplate('homePage', template);
                expect(component.template).toBeDefined();
            });

            it('can set the model value through the component', function() {
                component.setComponentValue('three');
                expect(model.get(component.modelPath,
                        component.datasourceId)).toEqual('three');
            });

            it('Updates component value in response to model changes', function() {
                model.set(component.modelPath, 'eight', component.datasourceId);
                expect(component.getComponentValue()).toEqual('eight');
            });

//            // TODO: integrate this test
//            it('can be unbound from a component', function() {
//                component.modelChanged = false;
//                model.removeListener(component, Cajeta.Events.EVENT_MODELCACHE_CHANGED,
//                    component.getEventOperand());
//                model.set('graphData.childTwo.ten', 'ten');
//                expect(component.modelChanged).toBeFalsy();
//            });
        });
    }
);
