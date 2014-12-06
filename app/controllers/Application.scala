package controllers

import models.Todo
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.Json
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  val newTodoForm: Form[Todo] = Form {
    mapping(
      "text" -> text
    )(Todo.create)(Todo.unapplyText)
  }

  def addTodo() = Action { implicit request =>
    newTodoForm.bindFromRequest.get.insert
    Redirect(routes.Application.index())
  }

  def getTodos = Action {
    Ok(Json.toJson(Todo.list))
  }
}