$(document).ready(function() {
    var $todos = $("#todos");
    $.get("/todos", function(todos) {
        $.each(todos, function(_, todo) { appendTodo($todos, todo); });
    });
    var $addTodoForm = $("#addTodoForm"),
        $addTodoText = $addTodoForm.find("input[name=text]");
    $addTodoForm.on('submit', function(e) {
        e.preventDefault();
        var text = $addTodoText.val();
        var success = function (todo) { appendTodo($todos, todo); $addTodoText.val(""); };
        addTodo(text, success, alertError);
    });
});

var noop = function() {};

var alertError = function(e) { return alert(e.responseText); };

var appendTodo = function($todos, todo) {
    $todos.append($("<li></li>").append(makeUpdateForm(todo)));
};

var makeUpdateForm = function(todo) {
    var completed = todo.completedOn !== undefined && todo.completedOn !== null;
    var $form, $text, $completed, $update, $delete;
    $form = $("<form></form>")
        .append($('<input type="hidden" name="id"/>').val(todo.id))
        .append($text = $('<input type="text" name="text"/>').val(todo.text))
        .append($completed = $('<input type="checkbox" name="completed"/>').prop('checked', completed))
        .append($update = $('<button>Update</button>'))
        .append($delete = $('<button>Delete</button>'))
        .on('submit', function(e) { e.preventDefault(); });
    $update.on('click', function () {
        updateTodo(todo.id, $text.val(), $completed.prop('checked'), noop, alertError);
    });
    $delete.on('click', function () {
        var success = function () { $form.parent().remove(); };
        deleteTodo(todo.id, success, alertError);
    });
    return $form;
};

var addTodo = function(text, success, error) {
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
    var r = jsRoutes.controllers.Application.deleteTodo(id);
    $.ajax({
        url: r.url,
        type: r.type,
        success: success,
        error: error
    });
};
