import { supabaseClient } from "@/utils/supabase";

//upload a single file
export async function UploadFile(file: File, path: string, bucketName: string) {
    const { data, error } = await supabaseClient
        .storage
        .from(bucketName || 'images')
        .upload(`images/${file.name}${Date.now()}`, file, {
            cacheControl: '3600',
            upsert: false
        })
    console.log(error)
    if (!data && error) throw new Error(`Error uploading file ${error}`)
    const NewFile = await supabaseClient.storage.from(bucketName || 'images').getPublicUrl(data.path)

    return { data, error, publicUrl: NewFile.data.publicUrl };
}

// upload array of file
export const uploadPhotos = async (files: File[]) => {
    const uploadedUrls: string[] = [];

    // Upload each file one by one
    for (let file of files) {
        const fileData = await UploadFile(file, 'images', 'First Bucket');
        uploadedUrls.push(fileData.publicUrl);
    }

    return uploadedUrls;
};