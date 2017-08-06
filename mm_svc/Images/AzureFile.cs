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
    // http://www.wintellect.com/devcenter/rrobinson/azure-bits-2-saving-the-image-to-azure-blob-storage

    public static class AzureFile
    {
        
        private static string _imageRootPath;
        private static string _containerName;
        private static string _blobStorageConnectionString;

        static AzureFile()
        {
            _imageRootPath = ConfigurationManager.AppSettings["ImageRootPath"];
            _containerName = ConfigurationManager.AppSettings["ImagesContainer"];
            _blobStorageConnectionString = ConfigurationManager.ConnectionStrings["BlobStorageConnectionString"].ConnectionString;
        }

        public static int Save(byte[] data, string file_name, string content_type)
        {
            var container = GetImagesBlobContainer();
            CloudBlockBlob blockBlob = container.GetBlockBlobReference(file_name);
            blockBlob.Properties.ContentType = content_type;

            blockBlob.UploadFromByteArray(data, 0, data.Length);
            g.LogInfo($"saved Azure file: {file_name}");
            return 1;
        }

        public static bool Exists(string file_name)
        {
            var container = GetImagesBlobContainer();
            var blob = container.GetBlockBlobReference(file_name);
            try {
                blob.FetchAttributes();
                return true;
            } catch (StorageException e) {
                return false;
            }
        }

        private static CloudBlobContainer GetImagesBlobContainer()
        {
            var storageAccount = CloudStorageAccount.Parse(_blobStorageConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference(_containerName);
            
            container.CreateIfNotExists();
            container.SetPermissions(
                new BlobContainerPermissions {
                    PublicAccess = BlobContainerPublicAccessType.Blob
                });
            return container;
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
