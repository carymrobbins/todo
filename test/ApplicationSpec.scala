import models.Todo
import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._
import play.api.libs.json._

import play.api.test._
import play.api.test.Helpers._

/**
 * Add your spec here.
 * You can mock out a whole application including requests, plugins etc.
 * For more information, consult the wiki.
 */
@RunWith(classOf[JUnitRunner])
class ApplicationSpec extends Specification {

  "Application" should {

    "send 404 on a bad request" in new WithApplication{
      route(FakeRequest(GET, "/boum")) must beNone
    }

    "render the index page" in new WithApplication{
      val home = route(FakeRequest(GET, "/")).get

      status(home) must equalTo(OK)
      contentType(home) must beSome.which(_ == "text/html")
    }

    "add a todo item" in new WithApplication{
      val r = FakeRequest(POST, "/todo").withJsonBody(Json.parse(""" {"text": "foo"} """))
      val add = route(r).get
      status(add) must equalTo(CREATED)
      contentType(add) must beSome.which(_ == "application/json")
      val id = contentAsJson(add) \ "id"
      id must beAnInstanceOf[JsNumber]
      Todo.findById(id.as[Long]).get.text mustEqual "foo"
    }

    "delete a todo item" in new WithApplication{
      val todo = Todo.create("foo")
      val r = FakeRequest(DELETE, "/todo/" + todo.id.get)
      val delete = route(r).get
      status(delete) must equalTo(NO_CONTENT)
      Todo.findById(todo.id.get) must beNone
    }
  }
}
