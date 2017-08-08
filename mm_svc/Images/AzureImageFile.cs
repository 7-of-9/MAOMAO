using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using mm_global;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace mm_svc.Images
{
    public enum AzureImageFileType {
        SiteLogo,
        TermPicture,
    }

    // http://www.wintellect.com/devcenter/rrobinson/azure-bits-2-saving-the-image-to-azure-blob-storage
    public static class AzureImageFile
    {
        private static string _terms_imageRootPath;
        private static string _terms_containerName;

        private static string _sites_imageRootPath;
        private static string _sites_containerName;

        private static string _blobStorageConnectionString;

        static AzureImageFile()
        {
            _terms_imageRootPath = ConfigurationManager.AppSettings["Terms_ImageRootPath"];
            _terms_containerName = ConfigurationManager.AppSettings["Terms_ImagesContainer"];

            _sites_imageRootPath = ConfigurationManager.AppSettings["Sites_ImageRootPath"];
            _sites_containerName = ConfigurationManager.AppSettings["Sites_ImagesContainer"];

            _blobStorageConnectionString = ConfigurationManager.ConnectionStrings["BlobStorageConnectionString"].ConnectionString;
        }

        public static int Save(byte[] data, AzureImageFileType type, string filename, string content_type)
        {
            var container = GetImagesBlobContainer(type);
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(filename);
            blockBlob.Properties.ContentType = content_type;

            blockBlob.UploadFromByteArray(data, 0, data.Length);
            g.LogInfo($"saved Azure file: {filename}");
            return 1;
        }

        public static bool Exists(AzureImageFileType type, string file_name)
        {
            var container = GetImagesBlobContainer(type);
            var blob = container.GetBlockBlobReference(file_name);
            try {
                blob.FetchAttributes();
                return true;
            } catch (StorageException e) {
                return false;
            }
        }

        private static CloudBlobContainer GetImagesBlobContainer(AzureImageFileType type)
        {
            var storageAccount = CloudStorageAccount.Parse(_blobStorageConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();

            int retry_count = 0;
again:
            try {
                var container = blobClient.GetContainerReference(type == AzureImageFileType.SiteLogo ? _sites_containerName
                                                            : type == AzureImageFileType.TermPicture ? _terms_containerName : null);

                container.CreateIfNotExists();
                container.SetPermissions(
                    new BlobContainerPermissions {
                        PublicAccess = BlobContainerPublicAccessType.Blob
                    });
                return container;
            } catch(Exception ex) {
                if (++retry_count < 3)
                    goto again;
                throw ex;
            }
        }

        //public async Task AddImageToBlobStorageAsync(UploadedImage image)
        //{
        //    //  get the container reference
        //    var container = GetImagesBlobContainer();

        //    // using the container reference, get a block blob reference and set its type
        //    CloudBlockBlob blockBlob = container.GetBlockBlobReference(image.Name);
        //    blockBlob.Properties.ContentType = image.ContentType;

        //    // finally, upload the image into blob storage using the block blob reference
        //    var fileBytes = image.Data;
        //    await blockBlob.UploadFromByteArrayAsync(fileBytes, 0, fileBytes.Length);
        //}

        //public async Task<UploadedImage> CreateUploadedImage(HttpPostedFileBase file)
        //{
        //    if ((file != null) && (file.ContentLength > 0) && !string.IsNullOrEmpty(file.FileName)) {
        //        byte[] fileBytes = new byte[file.ContentLength];
        //        await file.InputStream.ReadAsync(fileBytes, 0, Convert.ToInt32(file.ContentLength));
        //        return new UploadedImage {
        //            ContentType = file.ContentType,
        //            Data = fileBytes,
        //            Name = file.FileName,
        //            Url = string.Format("{ 0 }/{ 1 }",
        //            _imageRootPath,
        //            file.FileName)
        //    };
        //    }
        //    return null;
        //}
    }
}
