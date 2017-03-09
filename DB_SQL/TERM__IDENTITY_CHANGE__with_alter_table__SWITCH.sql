-- script new table term2 -- change identity spec (schema remains same)

alter table term2 alter column [name] nvarchar(128) COLLATE SQL_Latin1_General_CP1_CI_AI null
alter table dbo.[term] switch to dbo.[term2]

--select top 10 * from term


ALTER TABLE [dbo].[topic_link] DROP CONSTRAINT [FK_topic_link_term]
ALTER TABLE [dbo].[topic_link] DROP CONSTRAINT [FK_topic_link_term1]
ALTER TABLE [dbo].[user_url_classification] DROP CONSTRAINT [FK_user_url_classification_term]
ALTER TABLE [dbo].[golden_term] DROP CONSTRAINT [FK_golden_term_child]
ALTER TABLE [dbo].[golden_term] DROP CONSTRAINT [FK_golden_term_parent]




ALTER TABLE [dbo].[topic_link]  WITH CHECK ADD  CONSTRAINT [FK_topic_link_term] FOREIGN KEY([child_term_id])
REFERENCES [dbo].[term] ([id])
ALTER TABLE [dbo].[topic_link] CHECK CONSTRAINT [FK_topic_link_term]

ALTER TABLE [dbo].[topic_link]  WITH CHECK ADD  CONSTRAINT [FK_topic_link_term1] FOREIGN KEY([parent_term_id])
REFERENCES [dbo].[term] ([id])
ALTER TABLE [dbo].[topic_link] CHECK CONSTRAINT [FK_topic_link_term1]

ALTER TABLE [dbo].[user_url_classification]  WITH CHECK ADD  CONSTRAINT [FK_user_url_classification_term] FOREIGN KEY([term_id])
REFERENCES [dbo].[term] ([id])
ALTER TABLE [dbo].[user_url_classification] CHECK CONSTRAINT [FK_user_url_classification_term]

ALTER TABLE [dbo].[golden_term]  WITH CHECK ADD  CONSTRAINT [FK_golden_term_child] FOREIGN KEY([child_term_id])
REFERENCES [dbo].[term] ([id])
ALTER TABLE [dbo].[golden_term] CHECK CONSTRAINT [FK_golden_term_child]

ALTER TABLE [dbo].[golden_term]  WITH CHECK ADD  CONSTRAINT [FK_golden_term_parent] FOREIGN KEY([parent_term_id])
REFERENCES [dbo].[term] ([id])
ALTER TABLE [dbo].[golden_term] CHECK CONSTRAINT [FK_golden_term_parent]
