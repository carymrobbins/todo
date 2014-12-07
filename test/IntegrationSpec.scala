import models.Todo
import org.specs2.mutable._
import org.specs2.runner._
import org.junit.runner._

import play.api.test._
import play.api.test.Helpers._

/**
 * add your integration spec here.
 * An integration test will fire up a whole play application in a real (or headless) browser
 */
@RunWith(classOf[JUnitRunner])
class IntegrationSpec extends Specification {

  "Application" should {

    // TODO: This currently fails with TypeError: Cannot find function addEventListener in object [object HTMLDocument].
    "work from within a browser" in new WithBrowser {

      browser.goTo("http://localhost:" + port)

      // Create a new todo entry.
      browser.$("#addTodoForm > input[name=text]").text("foo")
      browser.$("#addTodoForm > button").click()

      // We should have cleared out the initial entry.
      browser.$("#addTodoForm > input[name=text]").getText must beEmpty

      // We should have added a new todo item to the list.
      browser.$("#todos > input[name=id]").getValue.toLong
      browser.$("#todos > input[name=text]").getText mustEqual "foo"

      // The new todo should exist in the database.
      Todo.list.head.text mustEqual "foo"
    }
  }
}
