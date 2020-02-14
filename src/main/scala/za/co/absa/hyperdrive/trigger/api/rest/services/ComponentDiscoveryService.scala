
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

package za.co.absa.hyperdrive.trigger.api.rest.services

import java.nio.file.Paths

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.scanner.{ComponentDescriptor, ComponentScanner}

import scala.util.{Failure, Success}

trait ComponentDiscoveryService {
  def getComponentDescriptors: Map[String, Seq[ComponentDescriptor]]
}

@Service
class ComponentDiscoveryServiceImpl extends ComponentDiscoveryService {
  private val logger = LoggerFactory.getLogger(this.getClass)

  override def getComponentDescriptors: Map[String, Seq[ComponentDescriptor]] = {
    val baseDir = Paths.get("/tmp/jars")
    val componentsTry = ComponentScanner.getComponents(baseDir)

    componentsTry match {
      case Failure(exception) => logger.error("Unexpected error occurred while getting components", exception)
        Map()
      case Success(components) => Map(
        "readers" -> components.readers,
        "decoders" -> components.decoders,
        "transformers" -> components.transformers,
        "writers" -> components.writers,
        "managers" -> components.managers
      )
    }
  }
}
