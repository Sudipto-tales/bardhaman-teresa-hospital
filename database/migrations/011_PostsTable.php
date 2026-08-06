<?php

/**
 * posts — §7. Replaces POSTS in site-data.mjs, blog.html and blog-post.html.
 *
 * post_tags is a real table rather than a JSON array because tags are read
 * across rows: the related-posts strip added in commit a3bb044 finds other
 * posts sharing this one's tags, which is a join and not a blob comparison.
 *
 * `author_id` points at doctors but carries no foreign key. A doctor can leave
 * — soft-deleted, or removed outright — and the articles they wrote stay up.
 * The renderer falls back to the hospital name when the author no longer
 * resolves.
 */
class PostsTable extends Migration
{
    public function up()
    {
        $this->create('posts', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'title VARCHAR(255) NOT NULL',
            'heading VARCHAR(255)',
            'excerpt TEXT',
            'body TEXT',
            'cover_image VARCHAR(500)',
            'category_id INT',
            'author_id INT',
            'read_minutes INT',
            'published_at DATETIME',
            $this->bool('featured'),
            'views INT NOT NULL DEFAULT 0',
            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('posts', 'slug', true);
        $this->index('posts', 'status');
        $this->index('posts', 'published_at');
        $this->index('posts', 'category_id');

        $this->create('post_tags', [
            $this->id(),
            'post_id INT NOT NULL',
            'category_id INT NOT NULL',
            'FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE',
            'FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE',
        ]);

        $this->index('post_tags', 'post_id, category_id', true);
        $this->index('post_tags', 'category_id');
    }

    public function down()
    {
        $this->drop('post_tags');
        $this->drop('posts');
    }
}
