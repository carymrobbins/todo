$(document).ready(function() {
    var $todos = $("#todos");
    writeTodosList($todos);
    configureAddTodoForm($todos);
    startTimeUpdater();
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
    configureDeleteButton(wrapper, todo.id);
    return wrapper.row;
};

var newUpdateFormWrapper = function(todo) {
    var $row = $('#updateTodoFormTemplate').find('.row.wrapper').clone();
    return updateUpdateFormWrapperFromTodo(todo, buildUpdateFormWrapper($row));
};

var updateUpdateFormWrapperFromTodo = function(todo, wrapper) {
    wrapper.form.data('todo', todo);
    wrapper.text.val(todo.text);
    updateCreatedOnField(wrapper.createdOn, todo.createdOn);
    updateCompletedOnField(wrapper.completedOn, todo.completedOn);
    wrapper.completed.prop('checked', todo.completedOn !== undefined);
    return wrapper;
};

var buildUpdateFormWrapper = function($row) {
    var $form = $row.find('form');
    return {
        row: $row,
        form: $form,
        text: $form.find('input[name=text]'),
        spinner: $form.find('.form-control-feedback'),
        completedOn: $form.find('.completedOn'),
        createdOn: $form.find('.createdOn'),
        completed: $form.find('input[name=completed]'),
        completedButton: $form.find('.completed-button'),
        deleteButton: $form.find('.delete-button')
    };
};

var buildUpdateEvent = function(todo, wrapper) {
    return function() {
        wrapper.spinner.removeClass('hide');
        var success = function(updatedTodo) {
            wrapper.form.data('todo', updatedTodo);
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
        toggleClass(wrapper.completedButton, wrapper.completed.prop('checked'),
                    'btn-success button-checked', 'btn-default button-unchecked');
    };
    updateButton();
    wrapper.completedButton.on('click', function() {
        toggleCheckbox(wrapper.completed);
        updateButton();
        updateEvent();
    });
};

var configureDeleteButton = function(wrapper, id) {
    var $modal = $('#deleteModal');
    wrapper.deleteButton.on('click', function() {
        $modal.find('.todo-text').text(wrapper.text.val());
        $modal.find('.cancel-button').on('click', function() { $modal.modal('hide'); });
        // Using .off() to remove any previous event handlers.
        $modal.find('.delete-button').off().on('click', function() {
            var success = function() {
                wrapper.row.remove();
                $modal.modal('hide');
            };
            deleteTodo(id, success, displayError);
        });
        $modal.modal('show');
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

var startTimeUpdater = function() {
    var everyMinute = 60000;
    setInterval(function() {
        $('.row.wrapper').each(function(_, el) {
            var wrapper = buildUpdateFormWrapper($(el)),
                todo = wrapper.form.data('todo');
            // If the data does not exist, we're in the form template.
            if (todo === undefined) return;
            updateCreatedOnField(wrapper.createdOn, todo.createdOn);
            updateCompletedOnField(wrapper.completedOn, todo.completedOn);
        });
    }, everyMinute);
};

var updateCreatedOnField = function($createdOn, createdOn) {
    return $createdOn.text(formatCreatedOn(createdOn));
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
