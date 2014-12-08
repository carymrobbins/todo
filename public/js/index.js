$(document).ready(function() {
    var $todos = $("#todos");
    writeTodosList($todos);
    configureAddTodoForm($todos);
});

var displayError = function(e, defaultError) {
    var error = (e && e.responseText) || defaultError || "Oops, an error occurred.",
        $modal = $('#errorModal');
    $modal.find('.error-message').text(error);
    $modal.find('.ok-button').on('click', function() { $modal.modal('hide'); });
    $modal.modal('show');
};

var configureAddTodoForm = function($todos) {
    var $addTodoForm = $("#addTodoForm"),
        $addTodoText = $addTodoForm.find("input[name=text]");
    $addTodoForm.on('submit', function(e) {
        e.preventDefault();
        var text = $addTodoText.val();
        var success = function(todo) { appendTodo($todos, todo); $addTodoText.val(""); };
        addTodo(text, success, displayError);
    });
};

var writeTodosList = function($todos) {
    var success = function(todos) {
        $.each(todos, function(_, todo) { appendTodo($todos, todo); });
    };
    getTodos(success, displayError);
};

var appendTodo = function($todos, todo) {
    $todos.append(makeUpdateForm(todo));
};

var makeUpdateForm = function(todo) {
    var wrapper = newUpdateFormWrapper(todo);
    wrapper.form.on('submit', function(e) { e.preventDefault(); });
    var updateEvent = buildUpdateEvent(todo, wrapper);
    configureUpdateText(wrapper, updateEvent);
    wrapper.update.on('click', updateEvent);
    wrapper.delete.on('click', function() {
        var success = function() { wrapper.row.remove(); };
        deleteTodo(todo.id, success, displayError);
    });
    return wrapper.row;
};

var newUpdateFormWrapper = function(todo) {
    var completed = todo.completedOn !== undefined,
        $row = $('#updateTodoFormTemplate').find('.row').clone(),
        $form = $row.find('form');
    return {
        row: $row,
        form: $form,
        text: $form.find('input[name=text]').val(todo.text),
        spinner: $form.find('.form-control-feedback'),
        completed: $form.find('input[name=completed]').prop('checked', completed),
        completedOn: updateCompletedOnField($form.find('.completedOn'), todo.completedOn),
        update: $form.find('.update-button'),
        delete: $form.find('.delete-button')
    };
};

var buildUpdateEvent = function(todo, wrapper) {
    return function() {
        wrapper.spinner.removeClass('hide');
        var success = function(updatedTodo) {
            updateCompletedOnField(wrapper.completedOn, updatedTodo.completedOn);
            // Allow the spinner to spin before hiding.
            setTimeout(function() { wrapper.spinner.addClass('hide'); }, 250);
        };
        updateTodo(todo.id, wrapper.text.val(), wrapper.completed.prop('checked'), success, displayError);
    };
};

var configureUpdateText = function(wrapper, updateEvent) {
    var oldText = wrapper.text.val();
    wrapper.text.on('keyup', $.debounce(250, function() {
        var newText = wrapper.text.val(),
            changed = newText !== oldText;
        oldText = newText;
        if (changed) updateEvent();
    }));
};

var updateCompletedOnField = function($completedOn, newCompletedOn) {
    return newCompletedOn === undefined
        ? $completedOn.text("")
        : $completedOn.text('Completed ' + moment(newCompletedOn).fromNow());
};

var getTodos = function(success, error) {
    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    var r = jsRoutes.controllers.Application.getTodos();
    $.ajax({
        url: r.url,
        type: r.type,
        success: success,
        error: error
    });
};

var addTodo = function(text, success, error) {
    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    var r = jsRoutes.controllers.Application.addTodo();
    $.ajax({
        url: r.url,
        type: r.type,
        data: {text: text},
        success: success,
        error: error
    });
};

var updateTodo = function(id, text, completed, success, error) {
    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    var r = jsRoutes.controllers.Application.updateTodo(id);
    $.ajax({
        url: r.url,
        type: r.type,
        data: {text: text, completed: completed},
        success: success,
        error: error
    });
};

var deleteTodo = function(id, success, error) {
    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    var r = jsRoutes.controllers.Application.deleteTodo(id);
    $.ajax({
        url: r.url,
        type: r.type,
        success: success,
        error: error
    });
};
