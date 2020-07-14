/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.models.tables

import java.io.StringWriter
import java.time.LocalDateTime

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.{DeserializationContext, DeserializationFeature, JsonDeserializer, JsonNode, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import slick.lifted.ProvenShape
import za.co.absa.hyperdrive.trigger.models.enums.DBOperation.DBOperation
import za.co.absa.hyperdrive.trigger.models.enums.JobStatuses.JobStatus
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes.JobType
import za.co.absa.hyperdrive.trigger.models.enums.{JobStatuses, JobTypes, SensorTypes}
import za.co.absa.hyperdrive.trigger.models.enums.SensorTypes.SensorType
import za.co.absa.hyperdrive.trigger.models.{Workflow, WorkflowHistory, WorkflowJoined}

trait WorkflowHistoryTable {
  this: Profile with JdbcTypeMapper =>
  import profile.api._

  final class WorkflowHistoryTable(tag: Tag) extends Table[WorkflowHistory](tag, _tableName = "workflow_history") {
    class SensorTypesDeserializer extends JsonDeserializer[SensorType] {
      override def deserialize(p: JsonParser, ctxt: DeserializationContext): SensorType = {
        val node = p.getCodec.readTree[JsonNode](p)
        val value = node.get("name").textValue()
        SensorTypes.sensorTypes.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
      }
    }

    class JobStatusesDeserializer extends JsonDeserializer[JobStatus] {
      override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobStatus = {
        val node = p.getCodec.readTree[JsonNode](p)
        val value = node.get("name").textValue()
        JobStatuses.statuses.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
      }
    }

    class JobTypesDeserializer extends JsonDeserializer[JobType] {
      override def deserialize(p: JsonParser, ctxt: DeserializationContext): JobType = {
        val node = p.getCodec.readTree[JsonNode](p)
        val value = node.get("name").textValue()
        JobTypes.jobTypes.find(_.name == value).getOrElse(throw new Exception("Failed to find enum value"))
      }
    }
    val module = new SimpleModule()
      .addDeserializer(classOf[SensorType], new SensorTypesDeserializer)
      .addDeserializer(classOf[JobStatus], new JobStatusesDeserializer)
      .addDeserializer(classOf[JobType], new JobTypesDeserializer)

    val objectMapper = new ObjectMapper()
      .registerModule(DefaultScalaModule)
      .registerModule(new JavaTimeModule())
      .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
      .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
      .configure(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES, false)
      .configure(DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES, true)
      .registerModule(module)

    implicit val configColumnType = MappedColumnType.base[WorkflowJoined, String](
      config => {
        val out = new StringWriter
        objectMapper.writeValue(out, config)
        out.toString
      },
      column => objectMapper.readValue(column, classOf[WorkflowJoined])
    )

    def changedOn: Rep[LocalDateTime] = column[LocalDateTime]("changed_on")
    def changedBy: Rep[String] = column[String]("changed_by")
    def operation: Rep[DBOperation] = column[DBOperation]("operation")
    def workflowId: Rep[Long] = column[Long]("workflow_id")
    def workflow: Rep[WorkflowJoined] = column[WorkflowJoined]("workflow")

    def * : ProvenShape[WorkflowHistory] = (changedOn, changedBy, operation, workflowId, workflow) <> (
      workflowTuple =>
        WorkflowHistory.apply(
          changedOn = workflowTuple._1,
          changedBy = workflowTuple._2,
          operation = workflowTuple._3,
          workflowId = workflowTuple._4,
          workflow = workflowTuple._5
        ),
      WorkflowHistory.unapply
    )
  }

  lazy val workflowHistoryTable = TableQuery[WorkflowHistoryTable]

}
