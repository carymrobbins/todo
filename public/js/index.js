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
    configureCompletedButton(wrapper, updateEvent);
    wrapper.delete.on('click', function() {
        var success = function() { wrapper.row.remove(); };
        deleteTodo(todo.id, success, displayError);
    });
    return wrapper.row;
};

var newUpdateFormWrapper = function(todo) {
    var completed = todo.completedOn !== undefined,
        $row = $('#updateTodoFormTemplate').find('.wrapper').clone(),
        $form = $row.find('form');
    return {
        row: $row,
        form: $form,
        text: $form.find('input[name=text]').val(todo.text),
        spinner: $form.find('.form-control-feedback'),
        completedOn: updateCompletedOnField($form.find('.completedOn'), todo.completedOn),
        createdOn: $form.find('.createdOn').text(formatCreatedOn(todo.createdOn)),
        completed: $form.find('input[name=completed]').prop('checked', completed),
        completedButton: $form.find('.completed-button'),
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

var configureCompletedButton = function(wrapper, updateEvent) {
    var updateButton = function() {
        toggleClass(wrapper.completedButton, wrapper.completed.prop('checked'), 'btn-success', 'btn-default');
    };
    updateButton();
    wrapper.completedButton.on('click', function() {
        toggleCheckbox(wrapper.completed);
        updateButton();
        updateEvent();
    });
};

var toggleCheckbox = function(checkbox) {
    if (checkbox.prop('checked') === true) {
        checkbox.prop('checked', false);
        return false;
    } else {
        checkbox.prop('checked', true);
        return true;
    }
};

var toggleClass = function(element, test, classIfTrue, classIfFalse) {
    element.removeClass(test ? classIfFalse : classIfTrue).addClass(test ? classIfTrue : classIfFalse);
};

var updateCompletedOnField = function($completedOn, newCompletedOn) {
    return newCompletedOn === undefined
        ? $completedOn.text("")
        : $completedOn.text(formatCompletedOn(newCompletedOn));
};

var formatFromNow = function(seconds) {
    // If we get a future time string, e.g. 'in a few seconds', then we are probably dealing
    // with a margin of error due to local/server time.  Assume it's basically 'just now'.
    var result = moment(seconds).fromNow();
    return result.indexOf('in') === 0 ? 'just now' : result;
};

var formatCreatedOn = function(createdOn) {
    return 'Created ' + formatFromNow(createdOn);
};

var formatCompletedOn = function(completedOn) {
    return 'Completed ' + formatFromNow(completedOn);
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
