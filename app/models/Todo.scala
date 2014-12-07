package models

import models.database.Todos
import org.joda.time.DateTime
import play.api.Play.current
import play.api.db.slick.Config.driver.simple._
import play.api.db.slick.DB
import play.api.libs.json.Json
import utils.DateTimeUtil


case class Todo(id: Option[Long], text: String, createdOn: DateTime, completedOn: Option[DateTime]) {
  private def forUpdate(newText: String, completed: Boolean): Todo = {
    val newCompletedOn = completedOn.orElse(Some(DateTimeUtil.utcNow())).filter(Function.const(completed))
    Todo(id, newText, createdOn, newCompletedOn)
  }
}

object Todo {
  private val todos: TableQuery[Todos] = TableQuery[Todos]
  val tupled = (Todo.apply _).tupled
  implicit val asJson = Json.format[Todo]
  def add(text: String) = DB.withSession { implicit session =>
    todos.insert(Todo(None, text, DateTimeUtil.utcNow(), None))
  }
  def list = DB.withSession { implicit session => todos.list }
  def findById(id: Long): Option[Todo] = DB.withSession { implicit session => todos.filter(_.id === id).firstOption }
  def update(id: Long, text: String, completed: Boolean): Option[Todo] = DB.withSession { implicit session =>
    Todo.findById(id).map(_.forUpdate(text, completed)) match {
      case None => None
      case Some(todo) =>
        Todo.todos.filter(_.id === id).update(todo)
        Some(todo)
    }
  }
}
