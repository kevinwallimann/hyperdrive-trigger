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

-- Migration due to https://github.com/AbsaOSS/hyperdrive/issues/85
UPDATE job_definition
SET maps = regexp_replace(maps, '(.*manager\.checkpoint\.base\.location=)([^"]*)(.*)', '\1\2/${reader.kafka.topic}\3')
WHERE substring(maps from 'manager\.checkpoint\.base\.location=[^"]*') IS NOT NULL;
