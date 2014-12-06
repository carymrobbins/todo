$(document).ready(function () {
    var $todos = $("#todos");
    $.get("/todos", function (todos) {
        $.each(todos, function (_, todo) {
            $todos.append($("<li></li>").text(todo.text));
        });
    });
});