CREATE TABLE [dbo].[user] (
    [id]       BIGINT        IDENTITY (2, 1) NOT NULL,
    [username] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED ([id] ASC)
);

